class AddGroupToLecturerDefenses < ActiveRecord::Migration[8.0]
  def change
    add_reference :lecturer_defenses, :group, foreign_key: true
  end
end
