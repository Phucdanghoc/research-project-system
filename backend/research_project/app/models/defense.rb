class Defense < ApplicationRecord
  # Associations
  has_many :groups
  has_many :lecturer_defenses, dependent: :destroy
  has_many :lecturer_users, through: :lecturer_defenses, source: :lecturer

  # Enum for status
  enum :status, { waiting: 0, done: 1 }

  # Validations
  validate :end_time_after_start_time
  validate :no_duplicate_group_times

  # Callbacks
  before_create :generate_unique_defense_code

  private

  def end_time_after_start_time
    return if start_time.blank? || end_time.blank?
    errors.add(:end_time, "must be after the start time") if end_time < start_time
  end

  def generate_unique_defense_code
    loop do
      self.defense_code = "DEF#{rand(1000..9999)}"
      break unless Defense.exists?(defense_code: defense_code)
    end
  end

  def no_duplicate_group_times
    return unless groups.loaded? || groups.any?

    seen = Set.new
    groups.each do |group|
      key = [group.start_time, group.end_time]
      if seen.include?(key)
        errors.add(:base, "Groups in a defense cannot have the same start and end time.")
        break
      else
        seen << key
      end
    end
  end
end
