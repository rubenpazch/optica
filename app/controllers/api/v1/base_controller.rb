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
end
