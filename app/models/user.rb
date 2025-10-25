class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  # Associations
  has_many :patients, dependent: :destroy
  has_many :prescriptions, dependent: :destroy

  # Enums
  enum :role, { sales: 0, admin: 1 }, default: :sales

  # Validations - enum handles validation automatically

  # Scopes
  scope :by_role, ->(role) { where(role: role) if role.present? }

  # Methods
  def admin?
    role == 'admin'
  end

  def sales?
    role == 'sales'
  end
end
