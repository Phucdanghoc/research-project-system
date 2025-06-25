# app/models/user.rb
class User < ApplicationRecord
  # Include Devise modules
  devise :database_authenticatable, :registerable,
        :recoverable, :rememberable,
        :jwt_authenticatable,
        jwt_revocation_strategy: Devise::JWT::RevocationStrategies::Null

  # Roles for users
  enum :role, { student: 0, lecturer: 1, secretary: 2, admin: 3 }

  # Validations for Student
  validates :student_code, presence: true, if: -> { student? }
  validates :class_name, presence: true, if: -> { student? }
  validates :faculty, presence: true, if: -> { student? || lecturer? }
  validates :major, presence: true, if: -> { student? }

  # Validations for Lecturer
  validates :lecturer_code, presence: true, if: -> { lecturer? }

  # Associations
  has_many :lecture_groups, class_name: "Group", foreign_key: "lecturer_id", dependent: :destroy

  has_many :group_users, dependent: :destroy
  has_many :groups, through: :group_users

  # Corrected association with proper foreign_key
  has_many :lecturer_defenses, foreign_key: :lecturer_id, dependent: :destroy
  has_many :defenses, through: :lecturer_defenses

  # Validation to enforce max 1 group for a Student
  validate :validate_student_group_count

  private

  def validate_student_group_count
    if student? && groups.size > 1
      errors.add(:groups, "Student cannot belong to more than 1 group.")
    end
  end
end
