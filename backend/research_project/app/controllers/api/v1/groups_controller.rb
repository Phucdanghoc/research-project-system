module Api
  module V1
    class GroupsController < ApplicationController
      before_action :authenticate_api_user!
      before_action :set_group, only: [:show, :update, :destroy]
      before_action :authorize_admin!, only: [:create, :update, :destroy]

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

      # GET /groups/:id
      def show
        render json: @group.to_json(include: [:lecturer, :defense, :students]), status: :ok
      end

      # POST /groups
      def create
        @group = Group.new(group_params)

        if @group.save
          render json: { message: "Group successfully created.", group: @group }, status: :created
        else
          render json: { errors: @group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /groups/:id
      def update
        if @group.update(group_params)
          render json: { message: "Group successfully updated.", group: @group }, status: :ok
        else
          render json: { errors: @group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /groups/:id
      def destroy
        @group.destroy
        render json: { message: "Group successfully destroyed." }, status: :ok
      end

      private

      def authorize_admin!
        unless current_user.admin?
          render json: { error: "Not authorized to perform this action." }, status: :forbidden
        end
      end

      def set_group
        @group = Group.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Group not found." }, status: :not_found
      end

      def group_params
        params.require(:group).permit(:name, :lecturer_id, :defense_id, student_ids: [])
      end
    end
  end
end
