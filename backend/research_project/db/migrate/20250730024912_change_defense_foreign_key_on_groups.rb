class ChangeDefenseForeignKeyOnGroups < ActiveRecord::Migration[8.0]
  def change
    remove_foreign_key :groups, :defenses
    add_foreign_key :groups, :defenses, on_delete: :nullify
  end
end
