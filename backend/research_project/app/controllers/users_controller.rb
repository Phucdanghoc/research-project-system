# app/controllers/users_controller.rb
class UsersController < ApplicationController
  before_action :authenticate_user!  # Devise + JWT authentication
  before_action :authorize_admin!, only: [:create, :index]

  # API endpoint for creating a new User
  def create
    @user = User.new(user_params)

    if @user.save
      render json: { message: "User successfully created.", user: @user }, status: :created
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # API endpoint for retrieving all users (admin only)
  def index
    @users = User.all.include(:groups)
    render json: @users.to_json(include: :groups), status: :ok
  end

  private

  # Check if the current user is an admin
  def authorize_admin! 
    unless current_user.admin?
      render json: { error: "Not authorized." }, status: :forbidden
    end
  end

  # Strong parameters for User
  def user_params
    params.require(:user).permit(
      :role,
      :email,
      :password,
      :password_confirmation,
      :name,
      :phone,
      :gender,
      :birth,
      :student_code,
      :class_name,
      :faculty,
      :major,
      :lecturer_code,
      :level
    )
  end
end
