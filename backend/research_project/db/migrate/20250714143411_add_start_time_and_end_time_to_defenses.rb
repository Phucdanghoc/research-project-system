class AddStartTimeAndEndTimeToDefenses < ActiveRecord::Migration[8.0]
  def change
    add_column :defenses, :start_time, :datetime
    add_column :defenses, :end_time, :datetime
  end
end
  