class DropGroupsUsersTable < ActiveRecord::Migration[7.0]
  def change
    drop_table :groups_users, if_exists: true
  end
end