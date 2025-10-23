class AddJtiToUsers < ActiveRecord::Migration[8.0]
  def up
    # First add the column without null constraint
    add_column :users, :jti, :string

    # Generate JTI for existing users
    User.find_each do |user|
      user.update_column(:jti, SecureRandom.uuid)
    end

    # Now add the null constraint and index
    change_column_null :users, :jti, false
    add_index :users, :jti, unique: true
  end

  def down
    remove_index :users, :jti
    remove_column :users, :jti
  end
end
