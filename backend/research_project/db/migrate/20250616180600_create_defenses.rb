class CreateDefenses < ActiveRecord::Migration[8.0]
  def change
    create_table :defenses do |t|
      t.string :name
      t.datetime :defenseTime
      t.integer :status

      t.timestamps
    end
  end
end
