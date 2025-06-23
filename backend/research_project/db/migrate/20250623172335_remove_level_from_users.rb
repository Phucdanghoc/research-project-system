class RemoveLevelFromUsers < ActiveRecord::Migration[8.0]
  def change
    remove_column :users, :level, :integer
  end
end
