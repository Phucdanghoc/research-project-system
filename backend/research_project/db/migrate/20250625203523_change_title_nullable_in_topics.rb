class ChangeTitleNullableInTopics < ActiveRecord::Migration[7.1]
  def change
    change_column_null :topics, :title, true
  end
end
