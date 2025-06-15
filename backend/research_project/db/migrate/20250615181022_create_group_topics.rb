class CreateGroupTopics < ActiveRecord::Migration[6.0]
  def change
    create_table :group_topics do |t|
      t.references :group, null: false, foreign_key: true
      t.references :topic, null: false, foreign_key: true

      t.timestamps
    end
  end
end
