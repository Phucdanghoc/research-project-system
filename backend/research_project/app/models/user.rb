class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  enum :role, { student: 0, lecturer: 1, secretary: 2, admin: 3 }

  devise :database_authenticatable, :registerable,
          :recoverable, :rememberable, :validatable,
          :jwt_authenticatable,
          jwt_revocation_strategy: Devise::JWT::RevocationStrategies::Null

  # Validations for Student
  validates :student_code, presence: true, if: -> { student? }
  validates :class_name, presence: true, if: -> { student? }
  validates :faculty, presence: true, if: -> { student? }
  validates :major, presence: true, if: -> { student? || lecturer? }
  
  # Validations for Lecturer
  validates :lecturer_code, presence: true, if: -> { lecturer? }
  validates :level, presence: true, if: -> { lecturer? }


  # Groups where this User is a lecturer
  has_many :lecture_groups, class_name: 'Group', foreign_key: 'lecturer_id'

  # Groups where this User is a student
  has_and_belongs_to_many :groups
end
