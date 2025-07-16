class CreatePlans < ActiveRecord::Migration[7.0]
  def change
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
