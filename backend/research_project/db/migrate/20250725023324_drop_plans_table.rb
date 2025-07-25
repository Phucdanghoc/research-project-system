class DropPlansTable < ActiveRecord::Migration[8.0]
  def up
    drop_table :plans
  end

  def down
    create_table :plans do |t|
      t.time :start_time
      t.time :end_time
      t.date :date
      t.references :group, null: false, foreign_key: true
      t.references :defense, null: false, foreign_key: true

      t.timestamps
    end
  end
end
