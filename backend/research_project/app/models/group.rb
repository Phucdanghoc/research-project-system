# app/models/group.rb
class Group < ApplicationRecord
  belongs_to :lecturer, class_name: 'User'
  has_and_belongs_to_many :students, class_name: 'User'
  
  validates :name, presence: true
  validates :lecturer, presence: true
  
  has_many :group_topics, dependent: :destroy
  has_many :topics, through: :group_topics
  has_many :students, class_name: 'User'
end
