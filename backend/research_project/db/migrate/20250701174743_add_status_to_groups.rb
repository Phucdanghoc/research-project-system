class AddStatusToGroups < ActiveRecord::Migration[6.0]
  def change
    add_column :groups, :status, :integer, default: 0, null: false
  end
end
