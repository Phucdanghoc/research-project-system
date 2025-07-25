class AddStartTimeAndEndTimeToLecturerDefenses < ActiveRecord::Migration[8.0]
  def change
    add_column :lecturer_defenses, :start_time, :time
    add_column :lecturer_defenses, :end_time, :time
  end
end
