class Defense < ApplicationRecord
  # Associations
  has_many :plans, dependent: :destroy
  has_many :groups
  has_many :lecturer_defenses, dependent: :destroy
  has_many :lecturer_users, through: :lecturer_defenses, source: :lecturer

  # Enum for status
  enum :status, { waiting: 0, done: 1 }

  # Validations
  validate :times_must_be_on_the_hour, if: -> { start_time.present? && end_time.present? }

  # Callbacks
  before_create :generate_unique_defense_code

  private

  def generate_unique_defense_code
    loop do
      self.defense_code = "DEF#{rand(1000..9999)}"
      break unless Defense.exists?(defense_code: defense_code)
    end
  end

  def times_must_be_on_the_hour
    if start_time.min != 0 || start_time.sec != 0
      errors.add(:start_time, "must be on the hour (e.g., 09:00)")
    end

    if end_time.min != 0 || end_time.sec != 0
      errors.add(:end_time, "must be on the hour (e.g., 11:00)")
    end
  end
end
