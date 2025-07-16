class RemoveTimesFromDefenses < ActiveRecord::Migration[8.0]
  def change
    remove_column :defenses, :defense_time, :datetime
    remove_column :defenses, :start_time, :datetime
    remove_column :defenses, :end_time, :datetime
  end
end
