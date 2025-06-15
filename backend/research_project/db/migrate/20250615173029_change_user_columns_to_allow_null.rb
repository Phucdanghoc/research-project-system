class ChangeUserColumnsToAllowNull < ActiveRecord::Migration[6.0]
  def change
    change_column_null :users, :student_code, true
    change_column_null :users, :class_name, true
    change_column_null :users, :faculty, true
    change_column_null :users, :major, true
    change_column_null :users, :lecturer_code, true
    change_column_null :users, :level, true
  end
end
