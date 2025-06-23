# lib/tasks/demo_data.rake
namespace :db do
  desc "Create dummy data for the application"
  task dummy_data: :environment do
    # Clear existing data in correct order to avoid ForeignKey violations
    GroupUser.delete_all
    GroupTopic.delete_all
    Group.delete_all
    Defense.delete_all
    Topic.delete_all
    User.delete_all

    # Create admin
    admin = User.create!(
      email: "admin@example.com",
      password: "password",
      password_confirmation: "password",
      role: :admin,
      name: "Administrator"
    )

    # Create secretaries
    2.times do |i|
      User.create!(
        email: "secretary#{i+1}@example.com",
        password: "password",
        password_confirmation: "password",
        role: :secretary,
        name: "Secretary#{i+1}"
      )
    end

    # Create lecturers
    lecturers = 5.times.map do |i|
      User.create!(
        email: "lecturer#{i+1}@example.com",
        password: "password",
        password_confirmation: "password",
        role: :lecturer,
        name: "Lecturer#{i+1}",
        lecturer_code: "LC#{100+i+1}",
        phone: "012345#{i+1}",
        birth: Date.new(1990+i, 1, 1),
        major: "Major#{i+1}"
      )
    end

    # Create students
    students = 10.times.map do |i|
      User.create!(
        email: "student#{i+1}@example.com",
        password: "password",
        password_confirmation: "password",
        role: :student,
        name: "Student#{i+1}",
        student_code: "ST#{100+i+1}",
        phone: "098765#{i+1}",
        birth: Date.new(2000+i, 1, 1),
        major: "Major#{i+1}",
        class_name: "Class#{i+1}",
        faculty: "Faculty#{i+1}"
      )
    end

    # Create defenses
    defenses = 3.times.map do |i|
      Defense.create!(
        name: "Defense#{i+1}",
        defenseTime: DateTime.now + (i+1).days,
        status: 0
      )
    end

    # Create groups
    groups = 4.times.map do |i|
      group = Group.create!(
        name: "Group#{i+1}",
        lecturer_id: lecturers.sample.id,
        defense_id: defenses.sample.id
      )

      # Associate 1 student to group (since each student can belong to max 1 group)
      student = students.select { |s| s.groups.empty? }.sample
      GroupUser.create!(group: group, user: student) if student

      group
    end

    # Create topics
    5.times do |i|
      Topic.create!(
        title: "Topic#{i+1}",
        topic_code: "TOP#{100+i+1}",
        description: "Description for topic#{i+1}",
        requirement: "Requirements for topic#{i+1}",
        topic_quantity: 5,
        student_quantity: 2,
        status: :active
      )
    end

    # Associate groups with topics
    Group.all.each do |group|
      group.topics << Topic.all.sample(2)
    end

    puts "✅ Dummy data successfully created!"
  rescue StandardError => e
    puts "❌ Failed to create dummy data: #{e.message}"
    puts e.backtrace
  end
end
