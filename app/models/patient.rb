class Patient < ApplicationRecord
  belongs_to :user

  # Validaciones
  validates :first_name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :last_name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true, length: { minimum: 10, maximum: 15 }
  validates :birth_date, presence: true
  validates :city, presence: true
  validates :state, presence: true

  # Scopes para búsqueda y filtrado
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :search, ->(term) {
    return all if term.blank?

    where("first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ? OR phone ILIKE ?",
          "%#{term}%", "%#{term}%", "%#{term}%", "%#{term}%")
  }
  scope :by_city, ->(city) { where(city: city) if city.present? }
  scope :by_state, ->(state) { where(state: state) if state.present? }

  # Métodos de instancia
  def full_name
    "#{first_name} #{last_name}"
  end

  def age
    return nil unless birth_date

    today = Date.current
    age = today.year - birth_date.year
    age -= 1 if today < birth_date + age.years
    age
  end

  def formatted_phone
    return phone unless phone&.length == 10

    "(#{phone[0..2]}) #{phone[3..5]}-#{phone[6..9]}"
  end

  def status_text
    active? ? "Activo" : "Inactivo"
  end

  # Métodos de clase para ordenamiento
  def self.sorted_by(sort_option)
    case sort_option
    when "name_asc"
      order(:first_name, :last_name)
    when "name_desc"
      order(first_name: :desc, last_name: :desc)
    when "email_asc"
      order(:email)
    when "email_desc"
      order(email: :desc)
    when "created_asc"
      order(:created_at)
    when "created_desc"
      order(created_at: :desc)
    when "age_asc"
      order(:birth_date)
    when "age_desc"
      order(birth_date: :desc)
    else
      order(:first_name, :last_name)
    end
  end
end
