class AddDefStatusToGroups < ActiveRecord::Migration[6.0]
  def change
    add_column :groups, :def_status, :integer, default: 0, null: false
  end
end