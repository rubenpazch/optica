class Prescription < ApplicationRecord
  belongs_to :patient
  belongs_to :user
  has_many :prescription_eyes, dependent: :destroy
  has_many :lenses, class_name: 'Lens', dependent: :destroy
  has_one :frame, class_name: 'Frame', dependent: :destroy

  accepts_nested_attributes_for :prescription_eyes, allow_destroy: true
  accepts_nested_attributes_for :lenses, allow_destroy: true
  accepts_nested_attributes_for :frame, allow_destroy: true

  validates :patient_id, :user_id, presence: true
  validates :order_number, uniqueness: true, allow_nil: true

  enum :status, { pending: 'pending', completed: 'completed', delivered: 'delivered', cancelled: 'cancelled' }

  scope :active, -> { where(status: ['pending', 'completed']) }
  scope :by_exam_date, -> { order(exam_date: :desc) }

  def od_eye
    prescription_eyes.find_by(eye_type: 'OD')
  end

  def os_eye
    prescription_eyes.find_by(eye_type: 'OS')
  end

  def total_balance
    (total_cost || 0) - (deposit_paid || 0)
  end

  def fully_paid?
    total_cost && deposit_paid && deposit_paid >= total_cost
  end

  def is_overdue?
    expected_delivery_date && expected_delivery_date < Date.current && status != 'delivered'
  end
end
