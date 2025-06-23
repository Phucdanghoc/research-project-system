module Api
  module V1
    class TopicsController < ApplicationController
      before_action :authenticate_api_user!
      before_action :set_topic, only: [:show, :update, :destroy]
      before_action :authorize_admin!, only: [:create, :update, :destroy]

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

      # GET /topics/:id
      def show
        render json: @topic.to_json(include: :groups), status: :ok
      end

      # POST /topics
      def create
        @topic = Topic.new(topic_params)

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

      private

      def authorize_admin!
        unless current_user.admin?
          render json: { error: "Not authorized to perform this action." }, status: :forbidden
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