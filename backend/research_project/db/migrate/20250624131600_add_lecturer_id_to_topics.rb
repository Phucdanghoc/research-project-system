class AddLecturerIdToTopics < ActiveRecord::Migration[7.0]
  def change
    add_column :topics, :lecturer_id, :bigint
    add_foreign_key :topics, :users, column: :lecturer_id
    add_index :topics, :lecturer_id
  end
end
