# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  # Hook into Devise’s strong parameter sanitization
  before_action :configure_sign_up_params, only: [:create]

  # Prevent setting flash messages
  def set_flash_message!(_kind, _options = {})
    # no-op
  end

  # Provide custom response after signing up
  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        message: 'Signed up successfully.',
        user: resource,
        token: JsonWebToken.encode(user_id: resource.id, role: resource.role)
      }, status: :created
    else
      render json: {
        message: 'Signup failed.',
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  protected

  def configure_sign_up_params
    # Allow :role to be set upon sign-up
    devise_parameter_sanitizer.permit(:sign_up, keys: [:role]) 
  end
end
