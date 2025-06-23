module Api
  module V1
    module Users
      class SessionsController < Devise::SessionsController

        skip_before_action :authenticate_api_user!, only: [:create, :verify_token]

        # POST /users/sign_in  (or /users/login if customized)
        def create
          user = User.find_by(email: params[:user][:email])

          if user&.valid_password?(params[:user][:password])
            token = JsonWebToken.encode(user_id: user.id, role: user.role)
            render json: { message: 'Logged in.', user: user, token: token }, status: :ok
          else
            render json: { error: 'Invalid email or password' }, status: :unauthorized
          end
        end

        # GET /users/verify_token
        def verify_token
          header = request.headers['Authorization']

          if header.present?
            token = header.split(' ').last

            begin
              decoded = JsonWebToken.decode(token)
              user = User.find_by(id: decoded[:user_id])

              if user
                render json: { valid: true, user: user }, status: :ok
              else
                render json: { valid: false, error: 'User not found' }, status: :unauthorized
              end

            rescue JWT::DecodeError, JWT::ExpiredSignature
              render json: { valid: false, error: 'Invalid or expired token' }, status: :unauthorized
            end

          else
            render json: { error: 'Authorization header missing' }, status: :bad_request
          end
        end

      end
    end
  end
end
