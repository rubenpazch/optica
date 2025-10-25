class PrescriptionSerializer
  def initialize(prescription)
    @prescription = prescription
  end

  def serializable_hash
    {
      id: @prescription.id,
      exam_date: @prescription.exam_date,
      observations: @prescription.observations,
      order_number: @prescription.order_number,
      total_cost: @prescription.total_cost,
      deposit_paid: @prescription.deposit_paid,
      balance_due: @prescription.total_balance,
      expected_delivery_date: @prescription.expected_delivery_date,
      status: @prescription.status,
      distance_va_od: @prescription.distance_va_od,
      distance_va_os: @prescription.distance_va_os,
      near_va_od: @prescription.near_va_od,
      near_va_os: @prescription.near_va_os,
      created_at: @prescription.created_at,
      updated_at: @prescription.updated_at,
      prescription_eyes: @prescription.prescription_eyes.map { |eye| serialize_eye(eye) },
      lenses: @prescription.lenses.map { |lens| serialize_lens(lens) },
      frame: serialize_frame(@prescription.frame),
      patient_id: @prescription.patient_id,
      user_id: @prescription.user_id
    }
  end

  private

  def serialize_eye(eye)
    {
      id: eye.id,
      eye_type: eye.eye_type,
      sphere: eye.sphere,
      cylinder: eye.cylinder,
      axis: eye.axis,
      add: eye.add,
      prism: eye.prism,
      prism_base: eye.prism_base,
      dnp: eye.dnp,
      npd: eye.npd,
      height: eye.height,
      notes: eye.notes
    }
  end

  def serialize_lens(lens)
    {
      id: lens.id,
      eye_type: lens.eye_type,
      lens_type: lens.lens_type,
      material: lens.material,
      coatings: lens.coatings.is_a?(String) ? JSON.parse(lens.coatings) : lens.coatings,
      index: lens.index,
      tint: lens.tint,
      photochromic: lens.photochromic,
      progressive: lens.progressive,
      special_properties: lens.special_properties,
      notes: lens.notes
    }
  end

  def serialize_frame(frame)
    return nil if frame.nil?

    {
      id: frame.id,
      brand: frame.brand,
      model: frame.model,
      material: frame.material,
      color: frame.color,
      style: frame.style,
      frame_width: frame.frame_width,
      lens_width: frame.lens_width,
      bridge_size: frame.bridge_size,
      temple_length: frame.temple_length,
      frame_cost: frame.frame_cost,
      special_features: frame.special_features,
      notes: frame.notes
    }
  end
end
