class AddCategoryToTopics < ActiveRecord::Migration[6.0]
  def change
    add_column :topics, :category, :string
  end
end
