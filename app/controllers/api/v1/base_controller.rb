class Api::V1::BaseController < ActionController::API
  include ActionController::MimeResponds

  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?

  respond_to :json

  private

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :email, :password, :password_confirmation ])
    devise_parameter_sanitizer.permit(:sign_in, keys: [ :email, :password, :remember_me ])
  end

  # Override Devise's authentication failure behavior for API
  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last

    if token
      begin
        jwt_payload = JWT.decode(token, Rails.application.credentials.devise_jwt_secret_key || Rails.application.secret_key_base).first
        @current_user = User.find(jwt_payload["sub"])
      rescue JWT::DecodeError, JWT::ExpiredSignature
        render_unauthorized
        return
      end
    else
      render_unauthorized
      return
    end

    super if @current_user.nil?
  end

  def current_user
    @current_user
  end

  def render_unauthorized
    render json: {
      error: "You need to sign in or sign up before continuing."
    }, status: :unauthorized
  end

  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_success(data = {}, message = "Success")
    render json: { message: message, data: data }, status: :ok
  end

  def authorize_admin!
    unless current_user&.admin?
      render json: {
        error: "You don't have permission to perform this action. Admin access required."
      }, status: :forbidden
    end
  end

  protected

  # Sanitize input parameters to prevent injection attacks
  def sanitize_params(params)
    params.transform_values { |value|
      case value
      when String
        # Remove any HTML/script tags and trim whitespace
        ActionController::Base.helpers.sanitize(value).strip
      when Hash
        sanitize_params(value)
      when Array
        value.map { |item| sanitize_params(item) if item.is_a?(Hash) || item.is_a?(String) }
      else
        value
      end
    }
  end

  # Validate email format
  def validate_email_format(email)
    email_regex = /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/
    email_regex.match?(email)
  end

  # Validate password strength (minimum requirements)
  def validate_password_strength(password)
    # Minimum 6 characters
    return false if password.blank? || password.length < 6

    # Can add more requirements if needed:
    # - At least one uppercase letter
    # - At least one number
    # - At least one special character
    true
  end

  # Rate limit check for a specific action (optional, works with rack-attack)
  def check_rate_limit
    # This is handled by Rack::Attack middleware
    # You can add custom rate limit checks here if needed
  end

  # Log security events for monitoring
  def log_security_event(event_type, details = {})
    Rails.logger.warn({
      timestamp: Time.current,
      event_type: event_type,
      user_id: current_user&.id,
      ip: request.ip,
      user_agent: request.user_agent,
      path: request.path,
      method: request.method,
      details: details
    }.to_json)
  end
end
