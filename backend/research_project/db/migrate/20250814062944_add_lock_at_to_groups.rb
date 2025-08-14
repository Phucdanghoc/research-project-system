class AddLockAtToGroups < ActiveRecord::Migration[7.0]
  def change
    add_column :groups, :lock_at, :datetime, null: true
  end
end
