module Api
  module V1
    class GroupsController < ApplicationController
      before_action :authenticate_api_user!
      before_action :set_group, only: [:show, :update, :destroy, :add_students]
      before_action :authorize_lecturer_or_admin!, only: [:create, :update, :destroy, :add_students]

      # GET /groups
      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @groups = Group
                    .includes(:lecturer, :defense, :students)
                    .order(created_at: :desc)
                    .page(page)
                    .per(per_page)

        render json: {
          groups: @groups.as_json(include: [:lecturer, :defense, :students]),
          current_page: @groups.current_page,
          total_pages: @groups.total_pages,
          total_count: @groups.total_count
        }, status: :ok
      end
      
      def search
        keyword = params[:keyword]

        if keyword.blank?
          return render json: { error: "Keyword is required." }, status: :bad_request
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @groups = Group
                    .includes(:lecturer, :defense, :students)
                    .where("groups.name ILIKE ?", "%#{keyword}%")
                    .order(created_at: :desc)
                    .page(page)
                    .per(per_page)

        render json: {
          groups: @groups.as_json(include: [:lecturer, :defense, :students]),
          current_page: @groups.current_page,
          total_pages: @groups.total_pages,
          total_count: @groups.total_count
        }, status: :ok
      end

      # GET /groups/:id
      def show
        render json: @group.to_json(include: [:lecturer, :defense, :students]), status: :ok
      end

      # POST /groups
    # POST /groups
    def create
      @group = Group.new(group_params.except(:topic_id))
      if current_user.lecturer?
        topic = Topic.find_by(id: params[:group][:topic_id])

        if topic.nil?
          return render json: { error: "Topic not found." }, status: :not_found
        end

        if topic.lecturer_id != current_user.id
          return render json: { error: "You can only create groups for your own topics." }, status: :forbidden
        end

        @group.lecturer_id = current_user.id
      end

      if @group.save
        if params[:group][:topic_id].present?
          @group.topics << Topic.find(params[:group][:topic_id])
        end

        render json: { message: "Group successfully created.", group: @group.as_json(include: [:lecturer, :defense, :students, :topics]) }, status: :created
      else
        render json: { errors: @group.errors.full_messages }, status: :unprocessable_entity
      end
    end

      # PATCH/PUT /groups/:id
      def update
        if current_user.lecturer?
          unless @group.topic.lecturer_id == current_user.id
            return render json: { error: "You can only update groups for your own topics." }, status: :forbidden
          end
        end

        if @group.update(group_params)
          render json: { message: "Group successfully updated.", group: @group }, status: :ok
        else
          render json: { errors: @group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /groups/:id
      def destroy
        if current_user.lecturer?
          unless @group.topic.lecturer_id == current_user.id
            return render json: { error: "You can only delete groups for your own topics." }, status: :forbidden
          end
        end

        @group.destroy
        render json: { message: "Group successfully destroyed." }, status: :ok
      end

      # POST /groups/:id/add_students
      def add_students
        if current_user.lecturer? && @group.topic.lecturer_id != current_user.id
          return render json: { error: "You can only add students to your own groups." }, status: :forbidden
        end

        student_ids = params[:student_ids]

        if student_ids.blank?
          return render json: { error: "Student IDs are required." }, status: :bad_request
        end

        @group.student_ids |= student_ids.map(&:to_i)

        if @group.save
          render json: { message: "Students successfully added.", group: @group.as_json(include: [:students]) }, status: :ok
        else
          render json: { errors: @group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def authorize_lecturer_or_admin!
        unless current_user.admin? || current_user.lecturer?
          render json: { error: "Not authorized to perform this action." }, status: :forbidden
        end
      end

      def set_group
        @group = Group.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Group not found." }, status: :not_found
      end

      def group_params
        params.require(:group).permit(:name, :lecturer_id, :defense_id, :topic_id, student_ids: [])
      end
    end
  end
end
