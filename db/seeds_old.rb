# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create a test user for authentication testing
unless User.exists?(email: 'test@example.com')
  User.create!(
    email: 'test@example.com',
    password: 'password123',
    password_confirmation: 'password123'
  )
  puts "Created test user: test@example.com (password: password123)"
end

# Create an admin user for testing
unless User.exists?(email: 'admin@example.com')
  User.create!(
    email: 'admin@example.com',
    password: 'admin123',
    password_confirmation: 'admin123'
  )
  puts "Created admin user: admin@example.com (password: admin123)"
end

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

# Create sample patients for development
if Rails.env.development?
  puts "\n" + "="*50
  puts "🏥 Creando pacientes de ejemplo..."
  puts "="*50
  
  # Limpiar pacientes existentes (opcional - descomenta si quieres empezar desde cero)
  # Patient.destroy_all
  # puts "🗑️ Pacientes anteriores eliminados"
  
  # Datos de ejemplo realistas
  sample_patients = [
    {
      first_name: "María", 
      last_name: "García López",
      email: "maria.garcia@email.com",
      phone: "+52 555-0123-456",
      birth_date: Date.new(1985, 3, 15),
      address: "Av. Reforma 123, Col. Centro",
      city: "Ciudad de México",
      state: "CDMX",
      zip_code: "06000",
      notes: "Paciente regular, prefiere lentes de contacto",
      active: true
    },
    {
      first_name: "Carlos", 
      last_name: "Rodríguez Morales",
      email: "carlos.rodriguez@gmail.com",
      phone: "+52 555-0987-654",
      birth_date: Date.new(1978, 11, 8),
      address: "Calle Juárez 456, Col. Roma",
      city: "Ciudad de México",
      state: "CDMX",
      postal_code: "06700",
      notes: "Astigmatismo en ambos ojos, usa lentes progresivos",
      active: true
    },
    {
      first_name: "Ana", 
      last_name: "Martínez Silva",
      email: "ana.martinez@hotmail.com",
      phone: "+52 555-0555-123",
      birth_date: Date.new(1992, 7, 22),
      address: "Insurgentes Sur 789, Col. Del Valle",
      city: "Ciudad de México",
      state: "CDMX",
      postal_code: "03100",
      notes: "Primera consulta, miopía leve",
      active: true
    },
    {
      first_name: "Roberto", 
      last_name: "Sánchez Torres",
      email: "roberto.sanchez@yahoo.com",
      phone: "+52 555-0777-888",
      birth_date: Date.new(1965, 1, 30),
      address: "Blvd. Manuel Ávila Camacho 321, Col. Polanco",
      city: "Ciudad de México",
      state: "CDMX",
      postal_code: "11560",
      notes: "Presbicia, necesita bifocales",
      active: true
    },
    {
      first_name: "Lucía", 
      last_name: "Fernández Ruiz",
      email: "lucia.fernandez@empresa.com",
      phone: "+52 555-0333-444",
      birth_date: Date.new(1988, 9, 12),
      address: "Paseo de la Reforma 567, Col. Cuauhtémoc",
      city: "Ciudad de México",
      state: "CDMX",
      postal_code: "06500",
      notes: "Trabajo con computadora, fatiga visual",
      active: true
    },
    {
      first_name: "Miguel", 
      last_name: "Hernández Castro",
      email: "miguel.hernandez@correo.mx",
      phone: "+52 555-0999-000",
      birth_date: Date.new(1975, 4, 18),
      address: "Eje Central 890, Col. Doctores",
      city: "Ciudad de México",
      state: "CDMX",
      postal_code: "06720",
      notes: "Diabetes, requiere seguimiento especial",
      active: false
    },
    {
      first_name: "Isabella", 
      last_name: "López Vargas",
      email: "isabella.lopez@universidad.edu",
      phone: "+52 555-0111-222",
      birth_date: Date.new(2001, 12, 5),
      address: "Av. Universidad 234, Col. Coyoacán",
      city: "Ciudad de México",
      state: "CDMX",
      postal_code: "04000",
      notes: "Estudiante universitaria, primera vez usando lentes",
      active: true
    },
    {
      first_name: "Francisco", 
      last_name: "Moreno Jiménez",
      email: "francisco.moreno@negocio.com",
      phone: "+52 555-0666-777",
      birth_date: Date.new(1982, 6, 27),
      address: "Calzada de Tlalpan 678, Col. Portales",
      city: "Ciudad de México",
      state: "CDMX",
      postal_code: "03300",
      notes: "Empresario, prefiere lentes sin armazón",
      active: true
    },
    {
      first_name: "Carmen", 
      last_name: "Ramírez Flores",
      email: "carmen.ramirez@hospital.gob.mx",
      phone: "+52 555-0444-555",
      birth_date: Date.new(1970, 10, 14),
      address: "Río Nilo 345, Col. Cuauhtémoc",
      city: "Ciudad de México",
      state: "CDMX",
      postal_code: "06500",
      notes: "Doctora, necesita lentes para cirugía",
      active: true
    },
    {
      first_name: "Diego", 
      last_name: "Torres Mendoza",
      email: "diego.torres@startup.tech",
      phone: "+52 555-0888-999",
      birth_date: Date.new(1995, 2, 8),
      address: "Av. Patriotismo 456, Col. San Pedro de los Pinos",
      city: "Ciudad de México",
      state: "CDMX",
      postal_code: "03800",
      notes: "Desarrollador de software, síndrome de ojo seco",
      active: true
    },
    {
      first_name: "Elena", 
      last_name: "Vásquez Herrera",
      email: "elena.vasquez@arte.mx",
      phone: "+52 555-0222-333",
      birth_date: Date.new(1987, 8, 19),
      address: "Calle Amsterdam 789, Col. Condesa",
      city: "Ciudad de México",
      state: "CDMX",
      postal_code: "06100",
      notes: "Artista visual, necesita precisión en colores",
      active: true
    },
    {
      first_name: "Alejandro", 
      last_name: "Gutiérrez Peña",
      email: "alejandro.gutierrez@construccion.com",
      phone: "+52 555-0123-789",
      birth_date: Date.new(1972, 5, 3),
      address: "Circuito Interior 123, Col. San Rafael",
      city: "Ciudad de México",
      state: "CDMX",
      postal_code: "06470",
      notes: "Ingeniero civil, lentes de seguridad graduados",
      active: false
    }
  ]
  
  # Crear pacientes
  created_count = 0
  sample_patients.each_with_index do |patient_data, index|
    # Verificar si el paciente ya existe
    existing_patient = Patient.find_by(email: patient_data[:email])
    
    if existing_patient
      puts "⚠️  Paciente ya existe: #{patient_data[:first_name]} #{patient_data[:last_name]}"
    else
      patient = Patient.create!(patient_data)
      created_count += 1
      puts "✅ Creado: #{patient.first_name} #{patient.last_name} (#{patient.email})"
    end
  end
  
  puts "\n" + "="*50
  puts "📊 RESUMEN DE PACIENTES CREADOS"
  puts "="*50
  puts "🆕 Pacientes nuevos: #{created_count}"
  puts "👥 Total en base de datos: #{Patient.count}"
  puts "✅ Pacientes activos: #{Patient.active.count}"
  puts "⏸️  Pacientes inactivos: #{Patient.inactive.count}"
  puts "🏙️ Ciudades diferentes: #{Patient.distinct.count(:city)}"
  
  puts "\n🎯 Datos para probar:"
  puts "   • Busca por: 'María', 'García', 'email.com'"
  puts "   • Filtra por ciudad: 'Ciudad de México'"
  puts "   • Ordena por: nombre, email, fecha"
  puts "   • Filtra por estado: activos/inactivos"
  puts "\n🚀 ¡Listo para probar el sistema de pacientes!"
end
