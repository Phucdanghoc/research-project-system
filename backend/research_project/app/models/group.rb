class Group < ApplicationRecord
  enum :status, { pending: 0, accepted: 1, denied: 2 }
  belongs_to :lecturer, class_name: "User"
  belongs_to :defense, optional: true
  
  validates :name, presence: true
  validates :lecturer, presence: true
  
  # Group memberships (students)
  has_many :group_users, dependent: :destroy
  has_many :students, through: :group_users, source: :user
  
  # Group-topic relationships
  has_many :group_topics, dependent: :destroy
  has_many :topics, through: :group_topics
end
