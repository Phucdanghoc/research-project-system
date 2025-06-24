class AddUniqueIndexToStudentCodeAndLecturerCode < ActiveRecord::Migration[7.0]
  def change
    add_index :users, :student_code, unique: true
    add_index :users, :lecturer_code, unique: true
  end
end