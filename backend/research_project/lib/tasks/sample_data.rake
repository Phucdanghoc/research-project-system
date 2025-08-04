# lib/tasks/sample_data.rake

namespace :db do
  desc "Generate sample data"
  task generate_sample_data: :environment do
    puts "⚙️  Generating sample data..."

    # Clean up existing data
    LecturerDefense.delete_all
    GroupTopic.delete_all
    GroupUser.delete_all
    Group.delete_all
    Topic.delete_all
    Defense.delete_all
    User.delete_all


    lecturers = 3.times.map do |i|
      User.create!(
        name: "Lecturer #{i + 1}",
        email: "lecturer#{i + 1}@example.com",
        password: "password",
        role: :lecturer,
        lecturer_code: "LC#{100 + i}",
        faculty: "Engineering"
      )
    end

    students = 10.times.map do |i|
      User.create!(
        name: "Student #{i + 1}",
        email: "student#{i + 1}@example.com",
        password: "password",
        role: :student,
        student_code: "ST#{1000 + i}",
        class_name: "Class #{i % 3 + 1}",
        faculty: "Engineering",
        major: "Computer Science"
      )
    end

    # Step 2: Create topics
    topics = 5.times.map do |i|
      Topic.create!(
        title: "Topic #{i + 1}",
        topic_code: "T#{1000 + i}",
        description: "Description for topic #{i + 1}",
        requirement: "Some requirement",
        topic_quantity: 3,
        student_quantity: 2,
        status: :open,
        lecturer: lecturers.sample,
        category: "General"
      )
    end

    # Step 3: Create groups
    groups = 4.times.map do |i|
      Group.create!(
        name: "Group #{i + 1}",
        lecturer: lecturers.sample,
        student_lead: students[i],
        description: "This is group #{i + 1}",
        status: :accepted,
        def_status: :waiting_defense
      )
    end

    # Step 4: Create defenses
    defenses = 2.times.map do |i|
      Defense.create!(
        name: "Defense #{i + 1}",
        status: :waiting,
        date: Date.today + i.days,
        start_time: Time.now,
        end_time: Time.now + 1.hour
      )
    end

    # Assign defenses to groups
    groups.each do |group|
      group.update!(defense: defenses.sample)
    end

    # Step 5: Assign students to groups
    students.each_with_index do |student, i|
      group = groups[i % groups.size]
      GroupUser.create!(group: group, user: student)
    end

    # Step 6: Assign topics to groups
    groups.each do |group|
      topic = topics.sample
      GroupTopic.create!(group: group, topic: topic)
    end

    # Step 7: Create lecturer defense scores (unique per lecturer+defense)
    defense_group_map = groups.group_by(&:defense_id)

    defense_group_map.each do |defense_id, related_groups|
      lecturers.each do |lecturer|
        group = related_groups.sample
        next unless group

        LecturerDefense.create!(
          defense: group.defense,
          lecturer: lecturer,
          group: group,
          point: rand(6.0..9.5).round(2),
          comment: "Well done"
        )
      end
    end

    puts "✅ Sample data generated!"
  end
end
