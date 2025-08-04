# lib/tasks/create_admin.rake

namespace :db do
  desc "Create only the admin user"
  task create_admin: :environment do
    puts "⚙️  Creating admin user..."

    User.create!(
      name: "Admin User",
      email: "admin@example.com",
      password: "password",
      role: :admin
    )

    puts "✅ Admin user created!"
  end
end
