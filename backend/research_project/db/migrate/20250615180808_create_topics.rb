class CreateTopics < ActiveRecord::Migration[6.0]
  def change
    create_table :topics do |t|
      t.string :title, null: false
      t.string :topic_code, null: false, unique: true
      t.text :description
      t.text :requirement
      t.integer :topic_quantity, default: 0
      t.integer :student_quantity, default: 0
      t.integer :status, default: 0

      t.timestamps
    end
  end
end
