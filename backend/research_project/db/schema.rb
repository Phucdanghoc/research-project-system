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

ActiveRecord::Schema[8.0].define(version: 2025_07_25_095948) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "defenses", force: :cascade do |t|
    t.string "name"
    t.integer "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "defense_code"
    t.time "start_time"
    t.time "end_time"
    t.date "date"
    t.index ["defense_code"], name: "index_defenses_on_defense_code", unique: true
  end

  create_table "group_topics", force: :cascade do |t|
    t.bigint "group_id", null: false
    t.bigint "topic_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id"], name: "index_group_topics_on_group_id"
    t.index ["topic_id"], name: "index_group_topics_on_topic_id"
  end

  create_table "group_users", force: :cascade do |t|
    t.bigint "group_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id", "user_id"], name: "index_group_users_on_group_id_and_user_id", unique: true
    t.index ["group_id"], name: "index_group_users_on_group_id"
    t.index ["user_id"], name: "index_group_users_on_user_id"
  end

  create_table "groups", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "lecturer_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "defense_id"
    t.integer "status", default: 0, null: false
    t.string "group_code"
    t.text "description"
    t.bigint "student_lead_id"
    t.integer "def_status", default: 0, null: false
    t.index ["defense_id"], name: "index_groups_on_defense_id"
    t.index ["group_code"], name: "index_groups_on_group_code", unique: true
    t.index ["lecturer_id"], name: "index_groups_on_lecturer_id"
  end

  create_table "lecturer_defenses", force: :cascade do |t|
    t.bigint "lecturer_id", null: false
    t.bigint "defense_id", null: false
    t.decimal "point", precision: 4, scale: 2
    t.text "comment"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "group_id"
    t.index ["defense_id"], name: "index_lecturer_defenses_on_defense_id"
    t.index ["group_id"], name: "index_lecturer_defenses_on_group_id"
    t.index ["lecturer_id", "defense_id"], name: "index_lecturer_defenses_on_lecturer_id_and_defense_id", unique: true
    t.index ["lecturer_id"], name: "index_lecturer_defenses_on_lecturer_id"
  end

  create_table "topics", force: :cascade do |t|
    t.string "title"
    t.string "topic_code", null: false
    t.text "description"
    t.text "requirement"
    t.integer "topic_quantity", default: 0
    t.integer "student_quantity", default: 0
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "lecturer_id"
    t.string "category"
    t.index ["lecturer_id"], name: "index_topics_on_lecturer_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "role", default: 0, null: false
    t.string "name"
    t.string "gender"
    t.string "phone"
    t.date "birth"
    t.string "student_code"
    t.string "class_name"
    t.string "faculty"
    t.string "major"
    t.string "lecturer_code"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["lecturer_code"], name: "index_users_on_lecturer_code", unique: true
    t.index ["phone"], name: "index_users_on_phone", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["student_code"], name: "index_users_on_student_code", unique: true
  end

  add_foreign_key "group_topics", "groups"
  add_foreign_key "group_topics", "topics"
  add_foreign_key "group_users", "groups"
  add_foreign_key "group_users", "users"
  add_foreign_key "groups", "defenses"
  add_foreign_key "groups", "users", column: "lecturer_id"
  add_foreign_key "groups", "users", column: "student_lead_id"
  add_foreign_key "lecturer_defenses", "defenses"
  add_foreign_key "lecturer_defenses", "groups"
  add_foreign_key "lecturer_defenses", "users", column: "lecturer_id"
  add_foreign_key "topics", "users", column: "lecturer_id"
end
