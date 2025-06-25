module Api
  module V1
    class UsersController < ApplicationController
      include UsersHelper

      before_action :authenticate_api_user!
      skip_before_action :authenticate_api_user!, only: [:verify_token]
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

      def create
        @user = User.new(user_params)

        if @user.save
          render json: { message: "User successfully created.", user: @user }, status: :created
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

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

      def show
        render json: @user.to_json(include: [:groups, :lecture_groups]), status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "User not found." }, status: :not_found
      end

      def update
        if @user.update(user_params)
          render json: { message: "User successfully updated.", user: @user }, status: :ok
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "User not found." }, status: :not_found
      end

      def verify_token
        token = params[:token]

        if token.present?
          begin
            decoded = JsonWebToken.decode(token)

            if decoded.present? && decoded[:user_id]
              user = User.find_by(id: decoded[:user_id])

              if user
                render json: { valid: true, user: user.as_json(only: [:id, :email, :role, :name]) }, status: :ok
              else
                render json: { valid: false }, status: :ok
              end
            else
              render json: { valid: false, error: "Invalid token" }, status: :ok
            end

          rescue JWT::ExpiredSignature
            Rails.logger.warn "Token expired!"
            render json: { valid: false, error: "Token expired" }, status: :ok
          rescue JWT::DecodeError => e
            Rails.logger.error "Decode error: #{e.message}"
            render json: { valid: false, error: "Invalid token" }, status: :ok
          end
        else
          Rails.logger.warn "Token missing!"
          render json: { valid: false, error: "Token missing" }, status: :ok
        end
      end



      def search
        keyword = params[:keyword]

        if keyword.blank?
          return render json: { error: "Keyword is required." }, status: :bad_request
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @users = User
                  .includes(:groups, :lecture_groups)
                  .where("name ILIKE ?", "%#{keyword}%")

        if is_numeric?(keyword)
          @users = @users.or(User.where(id: keyword))
        end

        @users = @users.order(created_at: :desc).page(page).per(per_page)

        render json: {
          users: @users.as_json(include: [:groups, :lecture_groups]),
          current_page: @users.current_page,
          total_pages: @users.total_pages,
          total_count: @users.total_count
        }, status: :ok
      end

      private

      def is_numeric?(string)
        true if Integer(string) rescue false
      end

      def authorize_admin!
        unless current_user.admin?
          render json: { error: "Not authorized." }, status: :forbidden
        end
      end

      def set_user
        @user = User.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "User not found." }, status: :not_found
      end

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
          :lecturer_code
        )
      end
    end
  end
end
