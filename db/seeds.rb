# Create test user
puts "="*50
puts "👤 Creando usuario de prueba..."
puts "="*50

User.destroy_all
test_user = User.create!(
  email: "test@optica.com",
  password: "password123",
  password_confirmation: "password123"
)
puts "✅ Usuario creado: #{test_user.email}"

# Crear pacientes de ejemplo
puts "="*50
puts "🏥 Creando pacientes de ejemplo..."
puts "="*50

# Limpiar pacientes existentes
Patient.destroy_all

# Create sample patients with required fields
patients_data = [
  {
    first_name: "Juan",
    last_name: "Pérez",
    email: "juan.perez@ejemplo.com",
    phone: "555-010661",
    birth_date: Date.new(1985, 3, 15),
    city: "Madrid",
    state: "Madrid",
    address: "Calle Gran Vía 123",
    zip_code: "28013",
    active: true
  },
  {
    first_name: "María",
    last_name: "García",
    email: "maria.garcia@ejemplo.com",
    phone: "555-026601",
    birth_date: Date.new(1990, 7, 22),
    city: "Barcelona",
    state: "Cataluña",
    address: "Avenida Diagonal 456",
    zip_code: "08008",
    active: true
  },
  {
    first_name: "Carlos",
    last_name: "Rodríguez",
    email: "carlos.rodriguez@ejemplo.com",
    phone: "555-030661",
    birth_date: Date.new(1978, 11, 8),
    city: "Sevilla",
    state: "Andalucía",
    address: "Plaza del Sol 789",
    zip_code: "41001",
    active: true
  },
  {
    first_name: "Ana",
    last_name: "Martínez",
    email: "ana.martinez@ejemplo.com",
    phone: "555-046601",
    birth_date: Date.new(1995, 2, 14),
    city: "Valencia",
    state: "Valencia",
    address: "Calle Valencia 321",
    zip_code: "46002",
    active: true
  },
  {
    first_name: "Luis",
    last_name: "López",
    email: "luis.lopez@ejemplo.com",
    phone: "555-050661",
    birth_date: Date.new(1982, 9, 30),
    city: "Bilbao",
    state: "País Vasco",
    address: "Gran Vía 654",
    zip_code: "48001",
    active: true
  },
  {
    first_name: "Carmen",
    last_name: "Fernández",
    email: "carmen.fernandez@ejemplo.com",
    phone: "555-066601",
    birth_date: Date.new(1975, 12, 3),
    city: "Zaragoza",
    state: "Aragón",
    address: "Ronda de la Comunicación 987",
    zip_code: "50001",
    active: true
  },
  {
    first_name: "Miguel",
    last_name: "Sánchez",
    email: "miguel.sanchez@ejemplo.com",
    phone: "555-066701",
    birth_date: Date.new(1988, 4, 18),
    city: "Murcia",
    state: "Murcia",
    address: "Calle de la Independencia 147",
    zip_code: "30001",
    active: true
  },
  {
    first_name: "Laura",
    last_name: "Jiménez",
    email: "laura.jimenez@ejemplo.com",
    phone: "555-080661",
    birth_date: Date.new(1992, 8, 25),
    city: "Madrid",
    state: "Madrid",
    address: "Paseo de la Castellana 258",
    zip_code: "28046",
    active: true
  }
]

created_count = 0

patients_data.each do |patient_attrs|
  begin
    patient_attrs[:user] = test_user  # Associate with the test user
    patient = Patient.create!(patient_attrs)
    puts "✓ Paciente creado: #{patient.first_name} #{patient.last_name}"
    created_count += 1
  rescue ActiveRecord::RecordInvalid => e
    puts "✗ Error creando paciente #{patient_attrs[:first_name]} #{patient_attrs[:last_name]}:"
    e.record.errors.full_messages.each do |error|
      puts "  - #{error}"
    end
  rescue => e
    puts "✗ Error creando paciente #{patient_attrs[:first_name]} #{patient_attrs[:last_name]}: #{e.message}"
  end
end

puts "\n#{created_count} pacientes creados exitosamente."
puts "#{Patient.count} pacientes en total en la base de datos."

puts "="*50
puts "🎉 Seed completado exitosamente!"
puts "="*50
