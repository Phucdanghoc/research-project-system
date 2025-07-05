module Api
  module V1
    class TopicsController < ApplicationController
      before_action :authenticate_api_user!
      before_action :set_topic, only: [:show, :update, :destroy]
      before_action :authorize_lecturer_or_admin!, only: [:create, :update, :destroy]


      def faculty_me
        faculty = current_user.faculty
        if faculty.blank?
          return render json: { error: "Current user's faculty is not set." }, status: :bad_request
        end

        topics = Topic.joins(:lecturer).where("LOWER(users.faculty) = ?", faculty.downcase)

        # Optional filter
        if params[:keyword].present?
          keyword = params[:keyword]
          topics = topics.where("title ILIKE :keyword OR topic_code ILIKE :keyword", keyword: "%#{keyword}%")
        end

        if params[:status].present?
          if Topic.statuses.keys.include?(params[:status])
            topics = topics.where(status: Topic.statuses[params[:status]])
          else
            return render json: { error: "Invalid status. Allowed: #{Topic.statuses.keys.join(', ')}" }, status: :bad_request
          end
        end

        if params[:category].present?
          topics = topics.where(category: params[:category])
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10
        paginated = topics.includes(:groups, :lecturer).order(created_at: :desc).page(page).per(per_page)

        render json: {
          topics: paginated.map { |t| topic_response(t) },
          current_page: paginated.current_page,
          total_pages: paginated.total_pages,
          total_count: paginated.total_count
        }, status: :ok
      end

      # GET /topics
      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @topics = Topic.includes(:groups, :lecturer).order(created_at: :desc).page(page).per(per_page)

        render json: {
          topics: @topics.map { |t| topic_response(t) },
          current_page: @topics.current_page,
          total_pages: @topics.total_pages,
          total_count: @topics.total_count
        }, status: :ok
      end

      def me
        topics = Topic.none

        if current_user.lecturer?
          topics = current_user.topics.includes(:groups)

        elsif current_user.student?
          group = current_user.groups.first
          topics = group.present? ? group.topics.includes(:groups, :lecturer) : Topic.none

        else
          return render json: { error: "Only students or lecturers can view their topics." }, status: :forbidden
        end

        # Keyword Search (title or topic_code)
        if params[:keyword].present?
          keyword = params[:keyword]
          topics = topics.where("title ILIKE :keyword OR topic_code ILIKE :keyword", keyword: "%#{keyword}%")
        end

        # Status Filter
        if params[:status].present?
          if Topic.statuses.keys.include?(params[:status])
            topics = topics.where(status: Topic.statuses[params[:status]])
          else
            return render json: { error: "Invalid status. Allowed: #{Topic.statuses.keys.join(', ')}" }, status: :bad_request
          end
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10

        paginated_topics = topics.order(created_at: :desc).page(page).per(per_page)

        render json: {
          topics: paginated_topics.map { |t| topic_response(t) },
          current_page: paginated_topics.current_page,
          total_pages: paginated_topics.total_pages,
          total_count: paginated_topics.total_count
        }, status: :ok
      end


      # GET /api/v1/topics/filter_by_status
      def filter_by_status
        status = params[:status]

        if status.blank? || !Topic.statuses.keys.include?(status)
          return render json: { error: "Invalid or missing status. Allowed: #{Topic.statuses.keys.join(', ')}" }, status: :bad_request
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @topics = Topic.includes(:groups, :lecturer)
                       .where(status: Topic.statuses[status])
                       .order(created_at: :desc)
                       .page(page)
                       .per(per_page)

        render json: {
          topics: @topics.map { |t| topic_response(t) },
          current_page: @topics.current_page,
          total_pages: @topics.total_pages,
          total_count: @topics.total_count
        }, status: :ok
      end

      # POST /api/v1/topics/generate
      def generate_topics
        unless current_user.admin?
          return render json: { error: "Only admins can generate topics." }, status: :forbidden
        end

        lecturer_id = params[:lecturer_id]
        quantity = params[:quantity].to_i

        if lecturer_id.blank? || !User.exists?(id: lecturer_id, role: User.roles[:lecturer])
          return render json: { error: "Invalid lecturer ID." }, status: :bad_request
        end

        if quantity <= 0
          return render json: { error: "Quantity must be a positive number." }, status: :bad_request
        end

        generated_topics = []

        quantity.times do
          unique_code = generate_unique_topic_code

          topic = Topic.new(
            topic_code: unique_code,
            lecturer_id: lecturer_id
          )

          if topic.save
            generated_topics << topic_response(topic)
          else
            return render json: { error: "Failed to generate topic: #{topic.errors.full_messages}" }, status: :unprocessable_entity
          end
        end

        render json: {
          message: "#{generated_topics.count} topics successfully generated.",
          topics: generated_topics
        }, status: :created
      end

      # GET /topics/:id
      def show
        render json: topic_response(@topic), status: :ok
      end

      # POST /topics
      def create
        @topic = Topic.new(topic_params.except(:topic_code))
        @topic.lecturer_id = current_user.id if current_user.lecturer?
        @topic.topic_code = generate_unique_topic_code

        if @topic.save
          render json: { message: "Topic successfully created.", topic: topic_response(@topic) }, status: :created
        else
          render json: { errors: @topic.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def filter_by_category
        category = params[:category]

        if category.blank?
          return render json: { error: "Category is required." }, status: :bad_request
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @topics = Topic.includes(:groups, :lecturer)
                       .where(category: category)
                       .order(created_at: :desc)
                       .page(page)
                       .per(per_page)

        render json: {
          topics: @topics.map { |t| topic_response(t) },
          current_page: @topics.current_page,
          total_pages: @topics.total_pages,
          total_count: @topics.total_count
        }, status: :ok
      end

      # PATCH/PUT /topics/:id
      def update
        if @topic.update(topic_params)
          render json: { message: "Topic successfully updated.", topic: topic_response(@topic) }, status: :ok
        else
          render json: { errors: @topic.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /topics/:id
      def destroy
        @topic.destroy
        render json: { message: "Topic successfully destroyed." }, status: :ok
      end

      def search
        keyword = params[:keyword]

        if keyword.blank?
          return render json: { error: "Keyword is required." }, status: :bad_request
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @topics = Topic.includes(:groups, :lecturer)
                       .where("title ILIKE :keyword OR topic_code ILIKE :keyword", keyword: "%#{keyword}%")
                       .order(created_at: :desc)
                       .page(page)
                       .per(per_page)

        render json: {
          topics: @topics.map { |t| topic_response(t) },
          current_page: @topics.current_page,
          total_pages: @topics.total_pages,
          total_count: @topics.total_count
        }, status: :ok
      end

      def search_by_lecturer
        lecturer_id = params[:id]
        keyword = params[:key]
        status = params[:status]
        category = params[:category]
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        unless User.exists?(id: lecturer_id, role: User.roles[:lecturer])
          return render json: { error: "Lecturer not found." }, status: :not_found
        end

        @topics = Topic.includes(:groups, :lecturer).where(lecturer_id: lecturer_id)

        if keyword.present?
          @topics = @topics.where("title ILIKE :keyword OR topic_code ILIKE :keyword", keyword: "%#{keyword}%")
        end

        if status.present?
          unless Topic.statuses.keys.include?(status)
            return render json: { error: "Invalid status. Allowed: #{Topic.statuses.keys.join(', ')}" }, status: :bad_request
          end
          @topics = @topics.where(status: Topic.statuses[status])
        end

        if category.present?
          @topics = @topics.where(category: category)
        end

        @topics = @topics.order(created_at: :desc).page(page).per(per_page)

        render json: {
          topics: @topics.map { |t| topic_response(t) },
          current_page: @topics.current_page,
          total_pages: @topics.total_pages,
          total_count: @topics.total_count
        }, status: :ok
      end

      private

      def topic_response(topic)
        lecturer = topic.lecturer

        topic.as_json(include: :groups).merge({
          lecturer: lecturer&.as_json(only: [:id, :name, :email, :phone, :faculty, :lecturer_code])
        })
      end


      def generate_unique_topic_code
        year = Time.current.year
        random_part = SecureRandom.alphanumeric(3).upcase

        loop do
          index = Topic.maximum(:id).to_i + 1
          code = "CTN.#{year}.#{random_part}.#{index}"
          break code unless Topic.exists?(topic_code: code)
        end
      end

      def authorize_lecturer_or_admin!
        if current_user.admin?
          return true
        elsif current_user.lecturer?
          if action_name.in?(%w[update destroy]) && @topic.lecturer_id != current_user.id
            return render json: { error: "You can only modify your own topics." }, status: :forbidden
          end
        else
          render json: { error: "Not authorized." }, status: :forbidden
        end
      end

      def set_topic
        @topic = Topic.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Topic not found." }, status: :not_found
      end

      def topic_params
        permitted = [
          :title,
          :description,
          :requirement,
          :topic_quantity,
          :student_quantity,
          :status,
          :category
        ]

        permitted << :lecturer_id if current_user.admin?

        params.require(:topic).permit(permitted)
      end
    end
  end
end
