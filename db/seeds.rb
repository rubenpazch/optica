# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Create a test user for development
if Rails.env.development?
  puts "Creating test user..."
  
  test_user = User.find_or_create_by(email: 'test@example.com') do |user|
    user.password = 'password123'
    user.password_confirmation = 'password123'
  end
  
  if test_user.persisted?
    puts "✅ Test user created successfully!"
    puts "📧 Email: test@example.com"
    puts "🔑 Password: password123"
  else
    puts "❌ Failed to create test user:"
    puts test_user.errors.full_messages
  end
  
  puts "Total users in database: #{User.count}"
end
