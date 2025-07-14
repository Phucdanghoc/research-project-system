class ChangePointPrecisionInLecturerDefenses < ActiveRecord::Migration[6.0] # or [8.0]
  def change
    change_column :lecturer_defenses, :point, :decimal, precision: 4, scale: 2
  end
end
