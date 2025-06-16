class ChangePhoneToAllowNullInUsers < ActiveRecord::Migration[6.0]
  def change
    change_column_null :users, :phone, true
  end
end
