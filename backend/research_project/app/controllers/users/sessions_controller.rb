class Users::SessionsController < Devise::SessionsController

  skip_before_action :authenticate_api_user!, only: :create
  def create
    user = User.find_by(email: params[:user][:email])

    if user && user.valid_password?(params[:user][:password])
      token = JsonWebToken.encode(user_id: user.id, role: user.role)
      render json: { message: 'Logged in.', user: user, token: token }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end
end
