# lib/tasks/demo_data.rake
namespace :db do
  desc "Create dummy admin user for the application"
  task dummy_data: :environment do
    admin = User.find_or_create_by!(email: "lec@example.com") do |user|
      user.password = "password"
      user.password_confirmation = "password"
      user.role = :lecturer
      user.name = "lec"
      user.lecturer_code ="LEC01234"
      user.faculty ="ehe"
    end
    puts "Admin user created: #{admin.email}"
  end
end
