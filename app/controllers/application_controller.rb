class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  # Skip CSRF protection for API requests
  skip_before_action :verify_authenticity_token, if: :api_request?

  # Require authentication by default for all controllers (except Devise controllers)
  before_action :authenticate_user!, unless: :devise_controller?

  # Skip authentication for React app fallback
  skip_before_action :authenticate_user!, only: [:fallback_index_html]

  # Configure permitted parameters for Devise
  before_action :configure_permitted_parameters, if: :devise_controller?

  # Fallback to serve React frontend for SPA routing
  def fallback_index_html
    send_file Rails.root.join("public", "index.html"), type: "text/html", disposition: "inline"
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :email, :password, :password_confirmation ])
    devise_parameter_sanitizer.permit(:account_update, keys: [ :email ])
  end

  private

  # Check if this is an API request
  def api_request?
    request.path.start_with?("/api/")
  end
end
