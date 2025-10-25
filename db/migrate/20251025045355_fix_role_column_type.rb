class FixRoleColumnType < ActiveRecord::Migration[8.1]
  def change
    # Convert string role values to integers
    reversible do |dir|
      dir.up do
        # Update any existing string values to match enum values before converting
        execute "UPDATE users SET role = '0' WHERE role = 'sales' OR role IS NULL"
        execute "UPDATE users SET role = '1' WHERE role = 'admin'"
        
        # Remove the old string default first
        execute "ALTER TABLE users ALTER COLUMN role DROP DEFAULT"
        
        # Change the column type from string to integer using USING clause
        execute "ALTER TABLE users ALTER COLUMN role TYPE integer USING role::integer"
        
        # Add the new integer default value
        execute "ALTER TABLE users ALTER COLUMN role SET DEFAULT 0"
        
        # Add NOT NULL constraint
        execute "ALTER TABLE users ALTER COLUMN role SET NOT NULL"
      end
      
      dir.down do
        # Revert back to string column if needed
        execute "ALTER TABLE users ALTER COLUMN role DROP DEFAULT"
        execute "ALTER TABLE users ALTER COLUMN role TYPE varchar USING CASE WHEN role = 1 THEN 'admin' ELSE 'sales' END"
        execute "ALTER TABLE users ALTER COLUMN role SET DEFAULT 'sales'"
        execute "ALTER TABLE users ALTER COLUMN role SET NOT NULL"
      end
    end
  end
end
