class CreatePatients < ActiveRecord::Migration[8.1]
  def change
    create_table :patients do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :phone
      t.date :birth_date
      t.text :address
      t.string :city
      t.string :state
      t.string :zip_code
      t.string :emergency_contact
      t.string :emergency_phone
      t.string :insurance_provider
      t.string :insurance_number
      t.text :notes
      t.boolean :active

      t.timestamps
    end
  end
end
