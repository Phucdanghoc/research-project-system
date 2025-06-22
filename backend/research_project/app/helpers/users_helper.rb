require 'csv'

module UsersHelper
  def import_users_from_csv(file_path)
    errors = []
    created_users = []

    expected_headers = %w[
      email password name phone gender birth role student_code class_name faculty major lecturer_code level
    ]

    CSV.foreach(file_path, headers: true) do |row|
      user_attrs = row.to_h.slice(*expected_headers)
      user_attrs["birth"] = parse_birth_date(user_attrs["birth"])

      user = User.new(user_attrs)

      if user.save
        created_users << user
      else
        errors << { row: row.to_h, messages: user.errors.full_messages }
      end
    end

    return { success: errors.empty?, errors:, created_users: }
  end

  private

  def parse_birth_date(date_str)
    return nil if date_str.blank?
    Date.parse(date_str) rescue nil
  end
end
