class Group < ApplicationRecord
  before_create :generate_group_code
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
  private

  def generate_group_code
    loop do
      self.group_code = "GR#{rand(1000..9999)}"
      break unless Group.exists?(group_code: group_code)
    end
  end
end
