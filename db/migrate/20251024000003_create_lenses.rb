class CreateLenses < ActiveRecord::Migration[8.1]
  def change
    create_table :lenses do |t|
      t.references :prescription, null: false, foreign_key: true
      t.string :eye_type # 'OD', 'OS', or 'Both'
      t.string :lens_type # 'Resin', 'Glass', 'Polycarbonate', etc.
      t.string :material # 'CR-39', 'Polycarbonate', 'Trivex', etc.
      t.text :coatings # JSON or text field for multiple coatings
      # Coatings examples: UV protection, Blue light filter, Anti-reflective, Scratch-resistant, Hydrophobic
      t.decimal :index, precision: 3, scale: 2 # Refractive index (1.5, 1.6, 1.67, 1.74)
      t.string :tint # 'None', 'Brown', 'Gray', 'Rose', etc.
      t.boolean :photochromic # Changes tint in sunlight
      t.boolean :progressive # Progressive/bifocal lenses
      t.text :special_properties # Any other special properties
      t.text :notes

      t.timestamps
    end

    add_index :lenses, [:prescription_id, :eye_type]
  end
end
