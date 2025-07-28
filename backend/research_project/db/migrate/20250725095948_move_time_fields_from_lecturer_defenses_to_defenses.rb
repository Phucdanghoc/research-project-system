class MoveTimeFieldsFromLecturerDefensesToDefenses < ActiveRecord::Migration[7.0]
  def up
    add_column :defenses, :start_time, :time
    add_column :defenses, :end_time, :time
    add_column :defenses, :date, :date

    execute <<-SQL.squish
      UPDATE defenses
      SET
        start_time = sub.start_time,
        end_time = sub.end_time,
        date = sub.date
      FROM (
        SELECT defense_id, MIN(start_time) AS start_time, MAX(end_time) AS end_time, MIN(date) AS date
        FROM lecturer_defenses
        GROUP BY defense_id
      ) AS sub
      WHERE defenses.id = sub.defense_id
    SQL

    remove_column :lecturer_defenses, :start_time
    remove_column :lecturer_defenses, :end_time
    remove_column :lecturer_defenses, :date
  end

  def down
    add_column :lecturer_defenses, :start_time, :time
    add_column :lecturer_defenses, :end_time, :time
    add_column :lecturer_defenses, :date, :date

    execute <<-SQL.squish
      UPDATE lecturer_defenses
      SET
        start_time = defenses.start_time,
        end_time = defenses.end_time,
        date = defenses.date
      FROM defenses
      WHERE lecturer_defenses.defense_id = defenses.id
    SQL

    remove_column :defenses, :start_time
    remove_column :defenses, :end_time
    remove_column :defenses, :date
  end
end
