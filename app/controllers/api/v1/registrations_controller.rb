class Api::V1::RegistrationsController < Devise::RegistrationsController
  include RackSessionsFix
  respond_to :json

  # Skip authentication for signup action
  skip_before_action :authenticate_user!, only: [ :create ]

  def create
    build_resource(sign_up_params)

    if resource.save
      render json: {
        status: {
          code: 200,
          message: "Signed up successfully."
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

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end
