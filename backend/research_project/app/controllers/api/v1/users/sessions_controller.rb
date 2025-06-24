module Api
  module V1
    module Users
      class SessionsController < Devise::SessionsController
        skip_before_action :authenticate_api_user!, only: [:create, :verify_token]

        # POST /api/v1/users/login
        def create
          user = User.find_by(email: params[:user][:email])

          if user&.valid_password?(params[:user][:password])
            token = JsonWebToken.encode(user_id: user.id, role: user.role)

            render json: {
              message: 'Logged in successfully',
              user: {
                id: user.id,
                email: user.email,
                role: user.role
              },
              token: token
            }, status: :ok
          else
            render json: { error: 'Invalid email or password' }, status: :unauthorized
          end
        end

        def verify_token
          header = request.headers['Authorization']
          token = header&.split(' ')&.last

          begin
            decoded = JsonWebToken.decode(token)
            user = User.find(decoded[:user_id])

            render json: {
              valid: true,
              user: {
                id: user.id,
                email: user.email,
                role: user.role
              }
            }, status: :ok
          rescue JWT::DecodeError, ActiveRecord::RecordNotFound
            render json: { valid: false, error: 'Invalid or expired token' }, status: :unauthorized
          end
        end
      end
    end
  end
end
