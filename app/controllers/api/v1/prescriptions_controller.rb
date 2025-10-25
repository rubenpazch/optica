class Api::V1::PrescriptionsController < Api::V1::BaseController
  before_action :set_patient, only: [:create, :index]
  before_action :set_prescription, only: [:show, :update, :destroy]
  before_action :authorize_prescription!, only: [:show, :update, :destroy]

  # GET /api/v1/patients/:patient_id/prescriptions
  def index
    authorize_patient!(@patient)
    @prescriptions = @patient.prescriptions.by_exam_date
    render json: PrescriptionSerializer.new(@prescriptions, is_collection: true).serializable_hash
  end

  # GET /api/v1/prescriptions/:id
  def show
    render json: PrescriptionSerializer.new(@prescription).serializable_hash
  end

  # POST /api/v1/patients/:patient_id/prescriptions
  def create
    authorize_patient!(@patient)
    @prescription = @patient.prescriptions.build(prescription_params)
    @prescription.user = current_user

    if @prescription.save
      render json: PrescriptionSerializer.new(@prescription).serializable_hash, status: :created
    else
      render json: { errors: @prescription.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/prescriptions/:id
  def update
    if @prescription.update(prescription_params)
      render json: PrescriptionSerializer.new(@prescription).serializable_hash
    else
      render json: { errors: @prescription.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/prescriptions/:id
  def destroy
    @prescription.destroy
    head :no_content
  end

  private

  def set_patient
    @patient = Patient.find(params[:patient_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Patient not found' }, status: :not_found
  end

  def set_prescription
    @prescription = Prescription.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Prescription not found' }, status: :not_found
  end

  def authorize_patient!(patient)
    render json: { error: 'Unauthorized' }, status: :forbidden unless patient.user == current_user
  end

  def authorize_prescription!
    render json: { error: 'Unauthorized' }, status: :forbidden unless @prescription.user == current_user
  end

  def prescription_params
    params.require(:prescription).permit(
      :exam_date, :observations, :order_number, :total_cost, :deposit_paid,
      :balance_due, :expected_delivery_date, :status, :distance_va_od, :distance_va_os,
      :near_va_od, :near_va_os,
      prescription_eyes_attributes: [:id, :eye_type, :sphere, :cylinder, :axis, :add, :prism, :prism_base, :dnp, :npd, :height, :notes, :_destroy],
      lenses_attributes: [:id, :eye_type, :lens_type, :material, :index, :tint, :photochromic, :progressive, :special_properties, :notes, :_destroy, { coatings: [] }],
      frame_attributes: [:id, :brand, :model, :material, :color, :style, :frame_width, :lens_width, :bridge_size, :temple_length, :frame_cost, :special_features, :notes]
    )
  end
end
