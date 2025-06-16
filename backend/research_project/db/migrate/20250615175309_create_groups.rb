# db/migrate/xxxxxxxx_create_groups.rb
class CreateGroups < ActiveRecord::Migration[6.1]
  def change
    create_table :groups do |t|
      t.string :name, null: false
      t.references :lecturer, null: false, index: true, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
