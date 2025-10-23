class Api::V1::PatientsController < Api::V1::BaseController
  before_action :set_patient, only: [ :show, :update, :destroy, :toggle_status ]

  # GET /api/v1/patients
  def index
    patients = Patient.all

    # Apply search if search term present
    patients = patients.search(params[:search]) if params[:search].present?

    # Apply filters
    patients = patients.by_city(params[:city]) if params[:city].present?
    patients = patients.by_state(params[:state]) if params[:state].present?
    patients = patients.active if params[:status] == "active"
    patients = patients.inactive if params[:status] == "inactive"

    # Apply sorting
    patients = patients.sorted_by(params[:sort])

    # Pagination with kaminari
    patients = patients.page(params[:page]).per(params[:per_page] || 10)

    # For filters in the frontend
    cities = Patient.distinct.pluck(:city).compact.sort
    states = Patient.distinct.pluck(:state).compact.sort

    render json: {
      patients: patients.as_json(include: [ :user ]),
      pagination: {
        current_page: patients.current_page,
        total_pages: patients.total_pages,
        total_count: patients.total_count,
        per_page: patients.limit_value
      },
      filters: {
        cities: cities,
        states: states
      }
    }
  end

  # GET /api/v1/patients/:id
  def show
    render json: @patient.as_json(include: [ :user ])
  end

  # POST /api/v1/patients
  def create
    @patient = Patient.new(patient_params)
    @patient.user = current_user

    if @patient.save
      render json: @patient.as_json(include: [ :user ]), status: :created
    else
      render json: { errors: @patient.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/patients/:id
  def update
    if @patient.update(patient_params)
      render json: @patient.as_json(include: [ :user ])
    else
      render json: { errors: @patient.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/patients/:id
  def destroy
    @patient.destroy
    head :no_content
  end

  # POST /api/v1/patients/:id/toggle_status
  def toggle_status
    @patient.toggle!(:active)
    render json: @patient.as_json(include: [ :user ])
  end

  private

  def set_patient
    @patient = Patient.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Patient not found" }, status: :not_found
  end

  def patient_params
    params.require(:patient).permit(:first_name, :last_name, :email, :phone, :address, :city, :state, :active, :notes)
  end
end
