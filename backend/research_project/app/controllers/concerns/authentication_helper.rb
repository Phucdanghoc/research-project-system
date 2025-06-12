# app/controllers/concerns/authentication_helper.rb
module AuthenticationHelper
  extend ActiveSupport::Concern

  def generate_jwt_response(user)
    token = JsonWebToken.encode(user_id: user.id, user_role: user.role)
    decoded = JsonWebToken.decode(token)
    expires_at = Time.at(decoded[:exp])

    {
      token: token,
      expires_at: expires_at,
      role: user.role
    }
  end
end
