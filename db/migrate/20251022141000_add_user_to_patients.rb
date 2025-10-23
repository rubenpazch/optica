class AddUserToPatients < ActiveRecord::Migration[8.0]
  def up
    # Add the column without null constraint first
    add_reference :patients, :user, foreign_key: true

    # If there are existing patients and a user, assign them to the first user
    if Patient.count > 0 && User.count > 0
      first_user = User.first
      Patient.update_all(user_id: first_user.id)
    end

    # Now add the null constraint
    change_column_null :patients, :user_id, false
  end

  def down
    remove_reference :patients, :user, foreign_key: true
  end
end
