class PrescriptionEye < ApplicationRecord
  belongs_to :prescription

  validates :eye_type, presence: true, inclusion: { in: %w(OD OS), message: "%{value} is not a valid eye type" }

  enum :eye_type, { OD: 'OD', OS: 'OS' }

  def eye_label
    eye_type == 'OD' ? 'Right Eye' : 'Left Eye'
  end

  def prescription_display
    parts = []
    parts << "#{format('%+.2f', sphere)}" if sphere.present?
    parts << "#{format('%+.2f', cylinder)}" if cylinder.present?
    parts << "#{axis}°" if axis.present?
    parts << "Add #{add}" if add.present?

    parts.join(" ")
  end
end
