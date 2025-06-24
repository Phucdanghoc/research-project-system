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

      # GET /topics/:id
      def show
        render json: @topic.to_json(include: :groups), status: :ok
      end

      # POST /topics
      def create
        @topic = Topic.new(topic_params)
        @topic.lecturer_id = current_user.id if current_user.lecturer? 

        # Format topic_code tự động thêm tiền tố TPC
        @topic.topic_code = "TPC#{@topic.topic_code}" unless @topic.topic_code.start_with?("TPC")

        if @topic.save
          render json: { message: "Topic successfully created.", topic: @topic }, status: :created
        else
          render json: { errors: @topic.errors.full_messages }, status: :unprocessable_entity
        end
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
      private

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
          :topic_code,
          :description,
          :requirement,
          :topic_quantity,
          :student_quantity,
          :status
        )
      end
    end
  end
end
