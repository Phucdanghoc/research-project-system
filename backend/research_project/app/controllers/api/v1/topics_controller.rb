module Api
  module V1
    class TopicsController < ApplicationController
      before_action :authenticate_api_user!
      before_action :set_topic, only: [:show, :update, :destroy]
      before_action :authorize_lecturer_or_admin!, only: [:create, :update, :destroy]

      # GET /topics
      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @topics = Topic
                    .includes(:groups)
                    .order(created_at: :desc)
                    .page(page)
                    .per(per_page)

        render json: {
          topics: @topics.as_json(include: :groups),
          current_page: @topics.current_page,
          total_pages: @topics.total_pages,
          total_count: @topics.total_count
        }, status: :ok
      end

      # GET /api/v1/topics/filter_by_status?status=active&page=1&per_page=10
      def filter_by_status
        status = params[:status]

        if status.blank? || !Topic.statuses.keys.include?(status)
          return render json: { error: "Invalid or missing status. Allowed: #{Topic.statuses.keys.join(', ')}" }, status: :bad_request
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @topics = Topic
                    .includes(:groups)
                    .where(status: Topic.statuses[status])
                    .order(created_at: :desc)
                    .page(page)
                    .per(per_page)

        render json: {
          topics: @topics.as_json(include: :groups),
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

        lecturer_id = params[:user_id]
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
            generated_topics << topic
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
        render json: @topic.to_json(include: :groups), status: :ok
      end

      # POST /topics
      def create
        @topic = Topic.new(topic_params.except(:topic_code))
        @topic.lecturer_id = current_user.id if current_user.lecturer?

        # Always auto-generate topic_code
        @topic.topic_code = generate_unique_topic_code

        if @topic.save
          render json: { message: "Topic successfully created.", topic: @topic }, status: :created
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

        @topics = Topic
                    .includes(:groups)
                    .where(category: category)
                    .order(created_at: :desc)
                    .page(page)
                    .per(per_page)

        render json: {
          topics: @topics.as_json(include: :groups),
          current_page: @topics.current_page,
          total_pages: @topics.total_pages,
          total_count: @topics.total_count
        }, status: :ok
      end

      # PATCH/PUT /topics/:id
      def update
        if @topic.update(topic_params)
          render json: { message: "Topic successfully updated.", topic: @topic }, status: :ok
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

        @topics = Topic
                    .includes(:groups)
                    .where("title ILIKE :keyword OR topic_code ILIKE :keyword", keyword: "%#{keyword}%")
                    .order(created_at: :desc)
                    .page(page)
                    .per(per_page)

        render json: {
          topics: @topics.as_json(include: :groups),
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

        @topics = Topic.includes(:groups).where(lecturer_id: lecturer_id)

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
          topics: @topics.as_json(include: :groups),
          current_page: @topics.current_page,
          total_pages: @topics.total_pages,
          total_count: @topics.total_count
        }, status: :ok
      end
      private
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
          if action_name.in?(%w[update destroy])
            unless @topic.lecturer_id == current_user.id
              return render json: { error: "You can only modify your own topics." }, status: :forbidden
            end
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
        params.require(:topic).permit(
          :title,
          :description,
          :requirement,
          :topic_quantity,
          :student_quantity,
          :status,
          :category
        )
      end
    end
  end
end
