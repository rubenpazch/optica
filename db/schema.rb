# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_10_25_045355) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "frames", force: :cascade do |t|
    t.string "brand"
    t.decimal "bridge_size", precision: 5, scale: 1
    t.string "color"
    t.datetime "created_at", null: false
    t.decimal "frame_cost", precision: 8, scale: 2
    t.decimal "frame_width", precision: 5, scale: 1
    t.decimal "lens_width", precision: 5, scale: 1
    t.string "material"
    t.string "model"
    t.text "notes"
    t.bigint "prescription_id", null: false
    t.text "special_features"
    t.string "style"
    t.decimal "temple_length", precision: 5, scale: 1
    t.datetime "updated_at", null: false
    t.index ["prescription_id"], name: "index_frames_on_prescription_id"
  end

  create_table "lenses", force: :cascade do |t|
    t.text "coatings"
    t.datetime "created_at", null: false
    t.string "eye_type"
    t.decimal "index", precision: 3, scale: 2
    t.string "lens_type"
    t.string "material"
    t.text "notes"
    t.boolean "photochromic"
    t.bigint "prescription_id", null: false
    t.boolean "progressive"
    t.text "special_properties"
    t.string "tint"
    t.datetime "updated_at", null: false
    t.index ["prescription_id", "eye_type"], name: "index_lenses_on_prescription_id_and_eye_type"
    t.index ["prescription_id"], name: "index_lenses_on_prescription_id"
  end

  create_table "patients", force: :cascade do |t|
    t.boolean "active"
    t.text "address"
    t.date "birth_date"
    t.string "city"
    t.datetime "created_at", null: false
    t.string "dni"
    t.string "email"
    t.string "emergency_contact"
    t.string "emergency_phone"
    t.string "first_name"
    t.string "insurance_number"
    t.string "insurance_provider"
    t.string "last_name"
    t.text "notes"
    t.string "phone"
    t.string "state"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.string "zip_code"
    t.index ["user_id"], name: "index_patients_on_user_id"
  end

  create_table "prescription_eyes", force: :cascade do |t|
    t.decimal "add", precision: 5, scale: 2
    t.integer "axis"
    t.datetime "created_at", null: false
    t.decimal "cylinder", precision: 5, scale: 2
    t.decimal "dnp", precision: 5, scale: 1
    t.string "eye_type"
    t.decimal "height", precision: 5, scale: 1
    t.text "notes"
    t.decimal "npd", precision: 5, scale: 1
    t.bigint "prescription_id", null: false
    t.decimal "prism", precision: 5, scale: 2
    t.string "prism_base"
    t.decimal "sphere", precision: 5, scale: 2
    t.datetime "updated_at", null: false
    t.index ["prescription_id", "eye_type"], name: "index_prescription_eyes_on_prescription_id_and_eye_type"
    t.index ["prescription_id"], name: "index_prescription_eyes_on_prescription_id"
  end

  create_table "prescriptions", force: :cascade do |t|
    t.decimal "balance_due", precision: 8, scale: 2
    t.datetime "created_at", null: false
    t.decimal "deposit_paid", precision: 8, scale: 2
    t.decimal "distance_va_od"
    t.decimal "distance_va_os"
    t.date "exam_date"
    t.date "expected_delivery_date"
    t.decimal "near_va_od"
    t.decimal "near_va_os"
    t.text "observations"
    t.string "order_number"
    t.bigint "patient_id", null: false
    t.string "status", default: "pending"
    t.decimal "total_cost", precision: 8, scale: 2
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["patient_id", "created_at"], name: "index_prescriptions_on_patient_id_and_created_at"
    t.index ["patient_id"], name: "index_prescriptions_on_patient_id"
    t.index ["user_id"], name: "index_prescriptions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "jti", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "role", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "frames", "prescriptions"
  add_foreign_key "lenses", "prescriptions"
  add_foreign_key "patients", "users"
  add_foreign_key "prescription_eyes", "prescriptions"
  add_foreign_key "prescriptions", "patients"
  add_foreign_key "prescriptions", "users"
end
