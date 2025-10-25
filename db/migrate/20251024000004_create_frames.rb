class CreateFrames < ActiveRecord::Migration[8.1]
  def change
    create_table :frames do |t|
      t.references :prescription, null: false, foreign_key: true
      t.string :brand
      t.string :model
      t.string :material # 'Acetate', 'Metal', 'Titanium', 'Plastic', etc.
      t.string :color
      t.string :style # 'Full-rim', 'Half-rim', 'Frameless', etc.
      t.decimal :frame_width, precision: 5, scale: 1 # in mm
      t.decimal :lens_width, precision: 5, scale: 1 # in mm
      t.decimal :bridge_size, precision: 5, scale: 1 # in mm
      t.decimal :temple_length, precision: 5, scale: 1 # in mm
      t.decimal :frame_cost, precision: 8, scale: 2
      t.text :special_features # Adjustable nose pads, spring hinges, etc.
      t.text :notes

      t.timestamps
    end
  end
end
