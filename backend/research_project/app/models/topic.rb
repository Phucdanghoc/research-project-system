class Topic < ApplicationRecord
  validates :topic_code, presence: true, uniqueness: true
  belongs_to :lecturer, class_name: "User", optional: true

  enum :status, { pending: 0, open: 1, closed: 2 }

  has_many :group_topics, dependent: :destroy
  has_many :groups, through: :group_topics
end
