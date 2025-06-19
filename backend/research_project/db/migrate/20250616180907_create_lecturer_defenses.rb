class CreateLecturerDefenses < ActiveRecord::Migration[8.0]
  def change
    create_table :lecturer_defenses do |t|
      t.references :lecturer, null: false, foreign_key: { to_table: :users }
      t.references :defense, null: false, foreign_key: true
      t.decimal :point, precision: 5, scale: 1
      t.text :comment

      t.timestamps
    end

    add_index :lecturer_defenses, [:lecturer_id, :defense_id], unique: true
  end
end
