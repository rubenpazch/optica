class Api::V1::SessionsController < Devise::SessionsController
  include RackSessionsFix
  respond_to :json

  # Skip authentication for login/logout actions
  skip_before_action :authenticate_user!, only: [ :create, :destroy ]

  # Override create action to handle login manually
  def create
    user = User.find_by(email: sign_in_params[:email])

    if user&.valid_password?(sign_in_params[:password])
      # Sign in the user
      sign_in(user)

      # Get JWT token from Warden
      token = request.env["warden-jwt_auth.token"]

      render json: {
        status: {
          code: 200,
          message: "Logged in successfully."
        },
        data: {
          user: UserSerializer.new(user).serializable_hash[:data][:attributes],
          token: token
        }
      }, status: :ok
    else
      render json: {
        error: "Invalid email or password"
      }, status: :unauthorized
    end
  end

  # Override destroy action to handle logout manually
  def destroy
    if request.headers["Authorization"].present?
      token = request.headers["Authorization"].split(" ").last

      begin
        jwt_payload = JWT.decode(token, Rails.application.credentials.devise_jwt_secret_key || Rails.application.secret_key_base).first
        user = User.find(jwt_payload["sub"])

        # Sign out the user (this will trigger JWT token revocation)
        sign_out(user) if user

        render json: {
          status: {
            code: 200,
            message: "Logged out successfully."
          }
        }, status: :ok
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        render json: {
          status: {
            code: 401,
            message: "Invalid token or user not found."
          }
        }, status: :unauthorized
      end
    else
      render json: {
        status: {
          code: 401,
          message: "No authorization token provided."
        }
      }, status: :unauthorized
    end
  end

  private

  def sign_in_params
    params.require(:user).permit(:email, :password)
  end

  def respond_with(current_user, _opts = {})
    render json: {
      status: {
        code: 200,
        message: "Logged in successfully."
      },
      data: {
        user: UserSerializer.new(current_user).serializable_hash[:data][:attributes]
      }
    }, status: :ok
  end

  def respond_to_on_destroy
    if request.headers["Authorization"].present?
      jwt_payload = JWT.decode(request.headers["Authorization"].split(" ").last, Rails.application.credentials.devise_jwt_secret_key || Rails.application.secret_key_base).first
      current_user = User.find(jwt_payload["sub"])
    end

    if current_user
      render json: {
        status: {
          code: 200,
          message: "Logged out successfully."
        }
      }, status: :ok
    else
      render json: {
        status: {
          code: 401,
          message: "Couldn't find an active session."
        }
      }, status: :unauthorized
    end
  end
end
