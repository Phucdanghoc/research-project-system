class AddGroupCodeToGroups < ActiveRecord::Migration[7.0]
  def change
    add_column :groups, :group_code, :string
    add_index :groups, :group_code, unique: true
  end
end
