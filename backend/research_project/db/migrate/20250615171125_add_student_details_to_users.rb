class AddStudentDetailsToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :student_code, :string
    add_column :users, :class_name, :string
    add_column :users, :faculty, :string
    add_column :users, :major, :string
    add_column :users, :lecturer_code, :string
    add_column :users, :level, :integer
  end
end
