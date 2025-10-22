class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes
  
  # Require authentication by default for all controllers (except Devise controllers)
  before_action :authenticate_user!, unless: :devise_controller?
  
  # Configure permitted parameters for Devise
  before_action :configure_permitted_parameters, if: :devise_controller?
  
  protected
  
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:email])
    devise_parameter_sanitizer.permit(:account_update, keys: [:email])
  end
  
  # Redirect to home page after successful login
  def after_sign_in_path_for(resource)
    root_path
  end
  
  # Redirect to login page after logout
  def after_sign_out_path_for(resource_or_scope)
    new_user_session_path
  end
end
