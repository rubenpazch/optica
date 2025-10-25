class Api::V1::UsersController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :authorize_admin!
  before_action :set_user, only: [:show, :update, :destroy, :reset_password]

  # GET /api/v1/users
  def index
    role = params[:role]
    
    # Validate role parameter if provided
    if role.present? && !["admin", "sales"].include?(role)
      return render json: { error: "Invalid role parameter" }, status: :bad_request
    end
    
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
    # Validate parameters
    email = user_params[:email]&.strip
    password = user_params[:password]
    role = user_params[:role]

    # Validate email format
    unless validate_email_format(email)
      log_security_event("invalid_user_creation_attempt", { reason: "invalid_email_format", email: email })
      return render json: { error: "Invalid email format" }, status: :bad_request
    end

    # Validate password strength
    unless validate_password_strength(password)
      log_security_event("invalid_user_creation_attempt", { reason: "weak_password" })
      return render json: { error: "Password must be at least 6 characters" }, status: :bad_request
    end

    # Validate role
    unless ["admin", "sales"].include?(role)
      log_security_event("invalid_user_creation_attempt", { reason: "invalid_role", role: role })
      return render json: { error: "Invalid role specified" }, status: :bad_request
    end

    # Check for duplicate email
    if User.exists?(email: email)
      log_security_event("user_creation_duplicate_email", { email: email })
      return render json: { error: "Email already exists" }, status: :unprocessable_entity
    end

    @user = User.new(user_params)

    if @user.save
      log_security_event("user_created", { user_id: @user.id, email: @user.email, role: @user.role })
      render json: {
        status: { code: 201, message: "User created successfully." },
        data: {
          user: UserSerializer.new(@user).serializable_hash[:data][:attributes]
        }
      }, status: :created
    else
      log_security_event("user_creation_failed", { errors: @user.errors.full_messages })
      render json: {
        status: { message: "User couldn't be created. #{@user.errors.full_messages.to_sentence}" }
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/users/:id
  def update
    email = user_update_params[:email]&.strip
    role = user_update_params[:role]

    # Validate email format if provided
    if email.present? && !validate_email_format(email)
      log_security_event("invalid_user_update", { user_id: @user.id, reason: "invalid_email_format" })
      return render json: { error: "Invalid email format" }, status: :bad_request
    end

    # Validate role if provided
    if role.present? && !["admin", "sales"].include?(role)
      log_security_event("invalid_user_update", { user_id: @user.id, reason: "invalid_role", role: role })
      return render json: { error: "Invalid role specified" }, status: :bad_request
    end

    # Check for duplicate email (excluding current user)
    if email.present? && email != @user.email && User.exists?(email: email)
      log_security_event("user_update_duplicate_email", { user_id: @user.id, email: email })
      return render json: { error: "Email already exists" }, status: :unprocessable_entity
    end

    if @user.update(user_update_params)
      log_security_event("user_updated", { user_id: @user.id, email: @user.email })
      render json: {
        status: { code: 200, message: "User updated successfully." },
        data: {
          user: UserSerializer.new(@user).serializable_hash[:data][:attributes]
        }
      }, status: :ok
    else
      log_security_event("user_update_failed", { user_id: @user.id, errors: @user.errors.full_messages })
      render json: {
        status: { message: "User couldn't be updated. #{@user.errors.full_messages.to_sentence}" }
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/users/:id
  def destroy
    if @user == current_user
      log_security_event("deletion_attempt_own_account", { user_id: @user.id })
      render json: { error: "You cannot delete your own account" }, status: :unprocessable_entity
      return
    end

    deleted_email = @user.email
    @user.destroy
    
    log_security_event("user_deleted", { user_id: @user.id, email: deleted_email, deleted_by: current_user.id })
    render json: { status: { code: 200, message: "User deleted successfully." } }, status: :ok
  end

  # POST /api/v1/users/:id/reset-password
  def reset_password
    # Validate that password was provided in request
    new_password = params.dig(:password)
    unless new_password.present?
      return render json: { error: "Password parameter is required" }, status: :bad_request
    end

    # Validate password strength
    unless validate_password_strength(new_password)
      log_security_event("invalid_password_reset", { user_id: @user.id, reason: "weak_password" })
      return render json: { error: "Password must be at least 6 characters" }, status: :bad_request
    end

    @user.password = new_password
    @user.password_confirmation = new_password

    if @user.save
      log_security_event("password_reset", { user_id: @user.id, email: @user.email, reset_by: current_user.id })
      render json: {
        status: { code: 200, message: "Password reset successfully." },
        data: {
          user_id: @user.id,
          email: @user.email,
          message: "Password has been reset successfully."
        }
      }, status: :ok
    else
      log_security_event("password_reset_failed", { user_id: @user.id, errors: @user.errors.full_messages })
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
