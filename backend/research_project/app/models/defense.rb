class Defense < ApplicationRecord
  # Groups related to this defense
  has_many :groups
  # Grading by lecturers
  has_many :lecturer_defenses, dependent: :destroy
  has_many :lecturer_users, through: :lecturer_defenses, source: :lecturer
end
