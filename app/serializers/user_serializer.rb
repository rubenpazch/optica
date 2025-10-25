class UserSerializer
  def initialize(user)
    @user = user
  end

  def serializable_hash
    {
      data: {
        attributes: {
          id: @user.id,
          email: @user.email,
          role: @user.role.to_s,
          created_at: @user.created_at
        }
      }
    }
  end
end
