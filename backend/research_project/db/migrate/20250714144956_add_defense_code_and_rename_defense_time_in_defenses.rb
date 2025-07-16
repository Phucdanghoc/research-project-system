class AddDefenseCodeAndRenameDefenseTimeInDefenses < ActiveRecord::Migration[6.0] # or 8.0
  def change
    add_column :defenses, :defense_code, :string
    add_index :defenses, :defense_code, unique: true

  end
end
