class LecturerDefense < ApplicationRecord
  belongs_to :defense
  belongs_to :lecturer, class_name: "User"
  belongs_to :group  

  validates :point, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 10 }, allow_nil: true
  validate :times_must_be_on_the_hour

  def times_must_be_on_the_hour
    return if start_time.blank? || end_time.blank?

    if start_time.min != 0 || start_time.sec != 0
      errors.add(:start_time, "must be on the hour (e.g., 09:00)")
    end

    if end_time.min != 0 || end_time.sec != 0
      errors.add(:end_time, "must be on the hour (e.g., 11:00)")
    end
  end

end
