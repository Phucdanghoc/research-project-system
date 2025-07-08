class AddStudentLeadToGroups < ActiveRecord::Migration[6.0]
  def change
    add_column :groups, :student_lead_id, :bigint
    add_foreign_key :groups, :users, column: :student_lead_id, null: false
  end
end
