class CreatePrescriptionEyes < ActiveRecord::Migration[8.1]
  def change
    create_table :prescription_eyes do |t|
      t.references :prescription, null: false, foreign_key: true
      t.string :eye_type # 'OD' for right eye, 'OS' for left eye
      t.decimal :sphere, precision: 5, scale: 2
      t.decimal :cylinder, precision: 5, scale: 2
      t.integer :axis # 0-180 degrees
      t.decimal :add, precision: 5, scale: 2 # Near addition for presbyopia
      t.decimal :prism, precision: 5, scale: 2
      t.string :prism_base # 'Up', 'Down', 'In', 'Out', etc.
      t.decimal :dnp, precision: 5, scale: 1 # Distance Pupillary Distance
      t.decimal :npd, precision: 5, scale: 1 # Near Pupillary Distance
      t.decimal :height, precision: 5, scale: 1 # Height/Center measurement
      t.text :notes

      t.timestamps
    end

    add_index :prescription_eyes, [:prescription_id, :eye_type]
  end
end
