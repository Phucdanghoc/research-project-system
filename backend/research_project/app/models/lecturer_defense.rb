class LecturerDefense < ApplicationRecord
  belongs_to :defense
  belongs_to :lecturer, class_name: "User"

  validates :point, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 10 }, allow_nil: true
end
