class ChangeTitleNullableInTopics < ActiveRecord::Migration[6.0]
  def change
    change_column_null :topics, :title, true
  end
end
