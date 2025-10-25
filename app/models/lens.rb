class Lens < ApplicationRecord
  self.table_name = "lenses"
  
  belongs_to :prescription

  validates :eye_type, inclusion: { in: %w(OD OS Both), message: "%{value} is not a valid eye type" }

  enum :eye_type, { OD: 'OD', OS: 'OS', Both: 'Both' }

  # Parse coatings from JSON if stored as JSON, or split by comma if stored as text
  def coatings_list
    return [] if coatings.blank?
    coatings.is_a?(String) ? coatings.split(',').map(&:strip) : coatings
  end

  def coatings_list=(list)
    self.coatings = list.is_a?(Array) ? list.join(', ') : list
  end

  def has_uv_protection?
    coatings_list.any? { |c| c.downcase.include?('uv') }
  end

  def has_blue_light_filter?
    coatings_list.any? { |c| c.downcase.include?('blue') }
  end

  def lens_description
    parts = []
    parts << lens_type if lens_type.present?
    parts << "(#{material})" if material.present?
    parts << "Index #{index}" if index.present?
    parts << tint if tint.present? && tint != 'None'
    parts << 'Photochromic' if photochromic?

    parts.join(' ')
  end
end
