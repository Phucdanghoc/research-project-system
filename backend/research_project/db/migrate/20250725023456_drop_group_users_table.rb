class DropGroupUsersTable < ActiveRecord::Migration[8.0]
  def up
    drop_table :group_users
  end

  def down
    create_table :group_users do |t|
      t.bigint :group_id, null: false
      t.bigint :user_id, null: false
      t.timestamps
    end

    add_index :group_users, :group_id
    add_index :group_users, :user_id
  end
end
