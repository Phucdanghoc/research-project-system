class Defense < ApplicationRecord
  has_many :groups, dependent: :nullify # ❗important change
  has_many :lecturer_defenses, dependent: :destroy
  has_many :lecturer_users, through: :lecturer_defenses, source: :lecturer

  enum :status, { waiting: 0, done: 1 }

  before_create :generate_unique_defense_code

  private

  def generate_unique_defense_code
    loop do
      self.defense_code = "DEF#{rand(1000..9999)}"
      break unless Defense.exists?(defense_code: defense_code)
    end
  end
end
