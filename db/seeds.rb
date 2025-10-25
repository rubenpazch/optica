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
    dni: "12345678",
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
    dni: "23456789",
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
    dni: "34567890",
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
    dni: "45678901",
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
    dni: "56789012",
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
    dni: "67890123",
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
    dni: "78901234",
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
    dni: "89012345",
    email: "laura.jimenez@ejemplo.com",
    phone: "555-080661",
    birth_date: Date.new(1992, 8, 25),
    city: "Madrid",
    state: "Madrid",
    address: "Paseo de la Castellana 258",
    zip_code: "28046",
    active: true
  },
  {
    first_name: "Roberto",
    last_name: "González",
    dni: "90123456",
    email: "roberto.gonzalez@ejemplo.com",
    phone: "555-090661",
    birth_date: Date.new(1980, 6, 12),
    city: "Alicante",
    state: "Valencia",
    address: "Calle del Carmen 369",
    zip_code: "03001",
    active: true
  },
  {
    first_name: "Sandra",
    last_name: "Ruiz",
    dni: "01234567",
    email: "sandra.ruiz@ejemplo.com",
    phone: "555-100661",
    birth_date: Date.new(1987, 1, 28),
    city: "Córdoba",
    state: "Andalucía",
    address: "Avenida del Brillante 741",
    zip_code: "14002",
    active: true
  },
  {
    first_name: "David",
    last_name: "Moreno",
    dni: "12012345",
    email: "david.moreno@ejemplo.com",
    phone: "555-110661",
    birth_date: Date.new(1993, 9, 5),
    city: "Valladolid",
    state: "Castilla y León",
    address: "Plaza Mayor 852",
    zip_code: "47001",
    active: true
  },
  {
    first_name: "Elena",
    last_name: "Castillo",
    dni: "23012345",
    email: "elena.castillo@ejemplo.com",
    phone: "555-120661",
    birth_date: Date.new(1986, 11, 14),
    city: "Palma",
    state: "Islas Baleares",
    address: "Paseo Marítimo 963",
    zip_code: "07012",
    active: true
  },
  {
    first_name: "Francisco",
    last_name: "Iglesias",
    dni: "34012345",
    email: "francisco.iglesias@ejemplo.com",
    phone: "555-130661",
    birth_date: Date.new(1979, 3, 22),
    city: "Santiago de Compostela",
    state: "Galicia",
    address: "Rúa do Hórreo 147",
    zip_code: "15701",
    active: true
  },
  {
    first_name: "Beatriz",
    last_name: "Santos",
    dni: "45012345",
    email: "beatriz.santos@ejemplo.com",
    phone: "555-140661",
    birth_date: Date.new(1991, 7, 9),
    city: "Oviedo",
    state: "Asturias",
    address: "Calle Uría 258",
    zip_code: "33003",
    active: true
  },
  {
    first_name: "Javier",
    last_name: "Vega",
    dni: "56012345",
    email: "javier.vega@ejemplo.com",
    phone: "555-150661",
    birth_date: Date.new(1984, 5, 17),
    city: "Pamplona",
    state: "Navarra",
    address: "Avenida del Ejército 369",
    zip_code: "31002",
    active: true
  },
  {
    first_name: "Mariana",
    last_name: "Flores",
    dni: "67012345",
    email: "mariana.flores@ejemplo.com",
    phone: "555-160661",
    birth_date: Date.new(1989, 12, 31),
    city: "Badajoz",
    state: "Extremadura",
    address: "Calle Barquilla 147",
    zip_code: "06001",
    active: true
  },
  {
    first_name: "Andrés",
    last_name: "Martín",
    dni: "78012345",
    email: "andres.martin@ejemplo.com",
    phone: "555-170661",
    birth_date: Date.new(1981, 8, 8),
    city: "Toledo",
    state: "Castilla-La Mancha",
    address: "Plaza de Zocodover 258",
    zip_code: "45001",
    active: true
  },
  {
    first_name: "Natalia",
    last_name: "Reyes",
    dni: "89012346",
    email: "natalia.reyes@ejemplo.com",
    phone: "555-180661",
    birth_date: Date.new(1994, 4, 3),
    city: "Logroño",
    state: "La Rioja",
    address: "Calle Sagasta 369",
    zip_code: "26001",
    active: true
  },
  {
    first_name: "Sergio",
    last_name: "Navarro",
    dni: "90123457",
    email: "sergio.navarro@ejemplo.com",
    phone: "555-190661",
    birth_date: Date.new(1983, 10, 20),
    city: "Cuenca",
    state: "Castilla-La Mancha",
    address: "Calle San Pedro 147",
    zip_code: "16001",
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

# Crear prescripciones de ejemplo
puts "="*50
puts "📋 Creando prescripciones de ejemplo..."
puts "="*50

# Limpiar prescripciones existentes
Prescription.destroy_all
PrescriptionEye.destroy_all
Lens.destroy_all
Frame.destroy_all

# Get the test user and their patients
test_user = User.first
all_patients = test_user.patients

# Define order number counter
order_number_counter = 1

# Create multiple prescriptions per patient
prescriptions_data = []

all_patients.each do |patient|
  # Create 2-3 random prescriptions per patient
  (2..3).to_a.sample.times do |i|
    prescriptions_data << {
      patient: patient,
      exam_date: Date.today - rand(10..180).days,
      observations: [
        "Prescripción de lentes progresivas",
        "Gafas de sol con graduación",
        "Lentes de contacto blandas",
        "Bifocales para lectura y distancia",
        "Lentes deportivas con protección UV",
        "Reemplazo de lentes rotos",
        "Lentes de transición fotosensibles",
        "Lentes correctivas para astigmatismo",
        "Gafas de seguridad graduadas",
        "Lentes premium con tratamiento especial"
      ].sample,
      order_number: format("ORD-%04d", order_number_counter),
      total_cost: rand(300..700).to_f,
      deposit_paid: rand(100..300).to_f,
      expected_delivery_date: Date.today + rand(1..30).days,
      status: ["pending", "completed", "delivered", "cancelled"].sample,
      distance_va_od: "20/#{rand(15..30)}",
      distance_va_os: "20/#{rand(15..30)}",
      near_va_od: "20/#{rand(15..30)}",
      near_va_os: "20/#{rand(15..30)}"
    }
    order_number_counter += 1
  end
end

created_prescriptions = 0

prescriptions_data.each do |rx_attrs|
  begin
    patient = rx_attrs.delete(:patient)
    prescription = Prescription.create!(
      user: test_user,
      patient: patient,
      **rx_attrs
    )
    
    # Create prescription eyes
    PrescriptionEye.create!(
      prescription: prescription,
      eye_type: "OD",
      sphere: -2.00,
      cylinder: -0.50,
      axis: 180,
      add: 1.50,
      prism: 0.0
    )
    
    PrescriptionEye.create!(
      prescription: prescription,
      eye_type: "OS",
      sphere: -2.50,
      cylinder: -0.75,
      axis: 175,
      add: 1.50,
      prism: 0.0
    )
    
    # Create lens
    Lens.create!(
      prescription: prescription,
      lens_type: ["plástico", "vidrio", "policarbonato", "trivex"].sample,
      coatings: ["anti-reflejante", "azul light", "fotosensible"].sample,
      material: "CR-39",
      eye_type: "Both",
      photochromic: [true, false].sample,
      progressive: [true, false].sample
    )
    
    # Create frame
    Frame.create!(
      prescription: prescription,
      brand: ["Armani", "Ray-Ban", "Oakley", "Prada", "Tom Ford"].sample,
      style: ["marco completo", "semi-sin montura", "sin montura"].sample,
      color: ["negro", "marrón", "plateado", "rojo", "azul"].sample,
      material: ["metal", "acetato", "titanio"].sample,
      model: "Modelo #{rand(100..999)}"
    )
    
    puts "✓ Prescripción creada: #{prescription.order_number} para #{patient.first_name} #{patient.last_name}"
    created_prescriptions += 1
  rescue => e
    puts "✗ Error creando prescripción: #{e.message}"
    puts e.backtrace.first(5)
  end
end

puts "\n#{created_prescriptions} prescripciones creadas exitosamente."
puts "#{Prescription.count} prescripciones en total en la base de datos."

puts "="*50
puts "🎉 Seed completado exitosamente!"
puts "="*50
