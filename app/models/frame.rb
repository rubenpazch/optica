class Frame < ApplicationRecord
  belongs_to :prescription

  def frame_description
    parts = []
    parts << brand if brand.present?
    parts << model if model.present?
    parts << "#{style}" if style.present?
    parts << color if color.present?

    parts.join(' - ')
  end

  def dimensions_display
    parts = []
    parts << "#{lens_width}mm" if lens_width.present?
    parts << "#{bridge_size}mm" if bridge_size.present?
    parts << "#{temple_length}mm" if temple_length.present?

    parts.join(', ')
  end
end
