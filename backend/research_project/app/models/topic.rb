class Topic < ApplicationRecord
  validates :title, presence: true
  validates :topic_code, presence: true, uniqueness: true

  enum :status, { inactive: 0, active: 1, closed: 2 }

  has_many :group_topics, dependent: :destroy
  has_many :groups, through: :group_topics
end