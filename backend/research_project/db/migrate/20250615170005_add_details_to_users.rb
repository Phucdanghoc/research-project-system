class AddDetailsToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :name, :string
    add_column :users, :gender, :string
    add_column :users, :phone, :string, null: false
    add_column :users, :birth, :date

    add_index :users, :phone, unique: true
  end
end
