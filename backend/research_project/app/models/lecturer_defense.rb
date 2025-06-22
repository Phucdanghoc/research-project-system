class LecturerDefense < ApplicationRecord
  belongs_to :defense
  belongs_to :lecturer, class_name: "User"

  validates :point, numericality: { minimum: 0, maximum: 10 }, allow_nil: true
end
