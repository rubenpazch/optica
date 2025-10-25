class Api::V1::RegistrationsController < Devise::RegistrationsController
  include RackSessionsFix
  respond_to :json

  # Only admins can create users
  before_action :authenticate_user!
  before_action :authorize_admin!, only: [:create, :destroy, :update]

  # Create a new user (admin only)
  def create
    build_resource(sign_up_params)
    resource.role = params[:user][:role] || 'sales'

    if resource.save
      render json: {
        status: {
          code: 200,
          message: "User created successfully."
        },
        data: {
          user: UserSerializer.new(resource).serializable_hash[:data][:attributes]
        }
      }, status: :ok
    else
      render json: {
        status: {
          message: "User couldn't be created successfully. #{resource.errors.full_messages.to_sentence}"
        }
      }, status: :unprocessable_entity
    end
  end

  # Reset password (admin only)
  def reset_password
    user = User.find_by(id: params[:user_id])

    if user.nil?
      render json: { error: "User not found" }, status: :not_found
      return
    end

    # Generate a temporary password
    temporary_password = SecureRandom.hex(8)
    user.password = temporary_password
    user.password_confirmation = temporary_password

    if user.save
      render json: {
        status: {
          code: 200,
          message: "Password reset successfully."
        },
        data: {
          user_id: user.id,
          temporary_password: temporary_password,
          message: "Please share this temporary password with the user. They should change it after login."
        }
      }, status: :ok
    else
      render json: {
        status: {
          message: "Password couldn't be reset. #{user.errors.full_messages.to_sentence}"
        }
      }, status: :unprocessable_entity
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :role)
  end

  def authorize_admin!
    render json: { error: "Only admins can perform this action" }, status: :forbidden unless current_user.admin?
  end
end
