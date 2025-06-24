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
      end
    end
  end
end
