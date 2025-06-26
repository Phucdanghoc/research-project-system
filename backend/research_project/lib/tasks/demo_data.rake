# lib/tasks/demo_data.rake
namespace :db do
  desc "Create dummy admin user for the application"
  task dummy_data: :environment do
    admin = User.find_or_create_by!(email: "admin@example.com") do |user|
      user.password = "password"
      user.password_confirmation = "password"
      user.role = :admin
      user.name = "Administrator"
    end
    puts "Admin user created: #{admin.email}"
  end
end
