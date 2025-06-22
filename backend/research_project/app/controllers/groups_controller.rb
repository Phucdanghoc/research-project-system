class GroupsController < ApplicationController
  before_action :authenticate_api_user!  # <- Use custom API authentication instead of Devise
  before_action :set_group, only: [:show, :update, :destroy]
  before_action :authorize_admin!, only: [:create, :update, :destroy]

  # GET /groups
  def index
    @groups = Group.all
    render json: @groups.to_json(include: [:lecturer, :defense, :students]), status: :ok
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

  # Check if the current user is an admin
  def authorize_admin! 
    unless current_user.admin?
      render json: { error: "Not authorized to perform this action." }, status: :forbidden
    end
  end

  # Set group by id
  def set_group
    @group = Group.find(params[:id])  
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Group not found." }, status: :not_found
  end

  # Strong parameters for Group
  def group_params
    params.require(:group).permit(:name, :lecturer_id, :defense_id, student_ids: [])
  end
end
