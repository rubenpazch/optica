class Api::V1::UsersController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :authorize_admin!
  before_action :set_user, only: [:show, :update, :destroy, :reset_password]

  # GET /api/v1/users
  def index
    role = params[:role]
    users = role.present? ? User.by_role(role) : User.all
    
    render json: {
      users: users.map { |u| UserSerializer.new(u).serializable_hash[:data][:attributes] }
    }
  end

  # GET /api/v1/users/:id
  def show
    render json: {
      user: UserSerializer.new(@user).serializable_hash[:data][:attributes]
    }
  end

  # POST /api/v1/users
  def create
    @user = User.new(user_params)

    if @user.save
      render json: {
        status: { code: 201, message: "User created successfully." },
        data: {
          user: UserSerializer.new(@user).serializable_hash[:data][:attributes]
        }
      }, status: :created
    else
      render json: {
        status: { message: "User couldn't be created. #{@user.errors.full_messages.to_sentence}" }
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/users/:id
  def update
    if @user.update(user_update_params)
      render json: {
        status: { code: 200, message: "User updated successfully." },
        data: {
          user: UserSerializer.new(@user).serializable_hash[:data][:attributes]
        }
      }, status: :ok
    else
      render json: {
        status: { message: "User couldn't be updated. #{@user.errors.full_messages.to_sentence}" }
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/users/:id
  def destroy
    if @user == current_user
      render json: { error: "You cannot delete your own account" }, status: :unprocessable_entity
      return
    end

    @user.destroy
    render json: { status: { code: 200, message: "User deleted successfully." } }, status: :ok
  end

  # POST /api/v1/users/:id/reset-password
  def reset_password
    temporary_password = SecureRandom.hex(8)
    @user.password = temporary_password
    @user.password_confirmation = temporary_password

    if @user.save
      render json: {
        status: { code: 200, message: "Password reset successfully." },
        data: {
          user_id: @user.id,
          email: @user.email,
          temporary_password: temporary_password,
          message: "Please share this temporary password with the user securely."
        }
      }, status: :ok
    else
      render json: {
        status: { message: "Password couldn't be reset. #{@user.errors.full_messages.to_sentence}" }
      }, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :role)
  end

  def user_update_params
    params.require(:user).permit(:email, :role)
  end
end
