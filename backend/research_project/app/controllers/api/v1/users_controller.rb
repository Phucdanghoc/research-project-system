# app/controllers/users_controller.rb
module Api
  module V1
    class UsersController < ApplicationController
      include UsersHelper

      before_action :authenticate_api_user!  # <- Use custom API authentication instead of Devise
      before_action :authorize_admin!, only: [:create, :index, :update, :import_csv]
      
      def import_csv
        if params[:file].nil?
          return render json: { error: "CSV file is required" }, status: :bad_request
        end

        result = import_users_from_csv(params[:file].path)

        if result[:success]
          render json: {
            message: "Users imported successfully.",
            count: result[:created_users].size
          }, status: :created
        else
          render json: {
            message: "Some users could not be imported.",
            errors: result[:errors]
          }, status: :unprocessable_entity
        end
      end
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
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @users = User
                  .includes(:groups, :lecture_groups)
                  .order(created_at: :desc)
                  .page(page)
                  .per(per_page)

        render json: {
          users: @users.as_json(include: [:groups, :lecture_groups]),
          current_page: @users.current_page,
          total_pages: @users.total_pages,
          total_count: @users.total_count
        }, status: :ok
      end

      # API endpoint for retrieving a single User
      def show
        render json: @user.to_json(include: [:groups, :lecture_groups]), status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "User not found." }, status: :not_found
      end

      # API endpoint for updating an existing User
      def update
        if @user.update(user_params)
          render json: { message: "User successfully updated.", user: @user }, status: :ok
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "User not found." }, status: :not_found
      end

      private

      # Check if the current user is an admin
      def authorize_admin! 
        unless current_user.admin?
          render json: { error: "Not authorized." }, status: :forbidden
        end
      end

      # Set user by id
      def set_user
        @user = User.find(params[:id]) 
      rescue ActiveRecord::RecordNotFound
        render json: { error: "User not found." }, status: :not_found
      end
      
      # Strong parameters for User
      def user_params
        # Note: normally we do NOT directly modify groups here
        # This should be done through GroupUsers controller
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
          :lecturer_code
        )
      end
    end
  end
end