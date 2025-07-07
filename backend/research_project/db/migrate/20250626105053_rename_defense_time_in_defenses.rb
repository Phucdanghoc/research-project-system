class RenameDefenseTimeInDefenses < ActiveRecord::Migration[8.0]
  def change
    rename_column :defenses, :defenseTime, :defense_time
  end
end
