class AddDefenseIdToGroups < ActiveRecord::Migration[8.0]
  def change
    add_reference :groups, :defense, null: true, foreign_key: true
  end
end
