require 'csv'

module UsersHelper
  def import_users_from_csv(file_path)
    created_users = []
    errors = []

    CSV.foreach(file_path, headers: true) do |row|
      user_data = row.to_hash.symbolize_keys

      # Clean/transform incoming data
      user_data[:birth] = parse_birth_date(user_data[:birth])

      # Check for duplicate fields
      duplicates = []
      duplicates << "email" if User.exists?(email: user_data[:email])
      duplicates << "phone" if user_data[:phone].present? && User.exists?(phone: user_data[:phone])
      duplicates << "student_code" if user_data[:student_code].present? && User.exists?(student_code: user_data[:student_code])
      duplicates << "lecturer_code" if user_data[:lecturer_code].present? && User.exists?(lecturer_code: user_data[:lecturer_code])

      if duplicates.any?
        errors << { row: row.to_hash, error: "Duplicate fields: #{duplicates.join(', ')}" }
        next
      end

      # Ensure password is present, generate if missing
      user_data[:password] = user_data[:password].presence || SecureRandom.hex(8)

      user = User.new(user_data)

      if user.save
        created_users << user
      else
        errors << { row: row.to_hash, error: user.errors.full_messages }
      end
    rescue => e
      errors << { row: row.to_hash, error: "Unexpected error: #{e.message}" }
    end

    { created_users: created_users, errors: errors }
  end

  private

  def parse_birth_date(date_str)
    return nil if date_str.blank?
    Date.parse(date_str) rescue nil
  end
end
