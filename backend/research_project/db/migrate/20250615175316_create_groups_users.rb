# db/migrate/xxxxxxxx_create_groups_users.rb
class CreateGroupsUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :groups_users do |t|
      t.references :group, null: false, index: true, foreign_key: true
      t.references :user, null: false, index: true, foreign_key: true

      t.timestamps
    end

    add_index :groups_users, [:group_id, :user_id], unique: true
  end
end
