class CreatePrescriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :prescriptions do |t|
      t.references :patient, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.date :exam_date
      t.text :observations
      t.string :order_number
      t.decimal :total_cost, precision: 8, scale: 2
      t.decimal :deposit_paid, precision: 8, scale: 2
      t.decimal :balance_due, precision: 8, scale: 2
      t.date :expected_delivery_date
      t.string :status, default: 'pending' # pending, completed, delivered, cancelled
      t.decimal :distance_va_od # Distance Visual Acuity - OD (Right eye)
      t.decimal :distance_va_os # Distance Visual Acuity - OS (Left eye)
      t.decimal :near_va_od # Near Visual Acuity - OD
      t.decimal :near_va_os # Near Visual Acuity - OS

      t.timestamps
    end

    add_index :prescriptions, [:patient_id, :created_at]
  end
end
