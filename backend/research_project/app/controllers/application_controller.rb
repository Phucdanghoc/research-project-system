# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  before_action :authenticate_api_user!

  private

  def authenticate_api_user! 
    auth_header = request.headers['Authorization']

    if auth_header.blank?
      render json: {error: 'Authorization header missing'}, status: :unauthorized
      return
    end

    token = auth_header.split(' ').last

    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id])
    rescue StandardError
      render json: {error: 'Invalid or expired token'}, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end
