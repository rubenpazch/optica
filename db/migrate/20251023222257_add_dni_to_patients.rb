class AddDniToPatients < ActiveRecord::Migration[8.1]
  def change
    add_column :patients, :dni, :string
  end
end
