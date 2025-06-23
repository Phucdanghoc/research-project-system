# frozen_string_literal: true
module Api
  module V1
    class Users::RegistrationsController < Devise::RegistrationsController
      respond_to :json
      before_action :configure_sign_up_params, only: [:create]

      def set_flash_message!(_kind, _options = {})
      end

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
        devise_parameter_sanitizer.permit(:sign_up, keys: [:role]) 
      end
    end
  end
end