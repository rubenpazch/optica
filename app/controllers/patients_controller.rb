class PatientsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_patient, only: [:show, :edit, :update, :destroy]
  
  # GET /patients
  def index
    @patients = Patient.all
    
    # Aplicar búsqueda si hay un término de búsqueda
    @patients = @patients.search(params[:search]) if params[:search].present?
    
    # Aplicar filtros
    @patients = @patients.by_city(params[:city]) if params[:city].present?
    @patients = @patients.by_state(params[:state]) if params[:state].present?
    @patients = @patients.active if params[:status] == 'active'
    @patients = @patients.inactive if params[:status] == 'inactive'
    
    # Aplicar ordenamiento
    @patients = @patients.sorted_by(params[:sort])
    
    # Paginación con kaminari
    @patients = @patients.page(params[:page]).per(5)
    
    # Para los filtros en la vista
    @cities = Patient.distinct.pluck(:city).compact.sort
    @states = Patient.distinct.pluck(:state).compact.sort
    
    respond_to do |format|
      format.html
      format.json { render json: @patients }
    end
  end
  
  # GET /patients/1
  def show
  end
  
  # GET /patients/new
  def new
    @patient = Patient.new
  end
  
  # GET /patients/1/edit
  def edit
  end
  
  # POST /patients
  def create
    @patient = Patient.new(patient_params)
    
    respond_to do |format|
      if @patient.save
        format.html { redirect_to @patient, notice: 'Paciente creado exitosamente.' }
        format.json { render :show, status: :created, location: @patient }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @patient.errors, status: :unprocessable_entity }
      end
    end
  end
  
  # PATCH/PUT /patients/1
  def update
    respond_to do |format|
      if @patient.update(patient_params)
        format.html { redirect_to @patient, notice: 'Paciente actualizado exitosamente.' }
        format.json { render :show, status: :ok, location: @patient }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @patient.errors, status: :unprocessable_entity }
      end
    end
  end
  
  # DELETE /patients/1
  def destroy
    @patient.destroy!
    
    respond_to do |format|
      format.html { redirect_to patients_path, alert: 'Paciente eliminado exitosamente.' }
      format.json { head :no_content }
    end
  end
  
  # POST /patients/1/toggle_status
  def toggle_status
    @patient = Patient.find(params[:id])
    @patient.update(active: !@patient.active)
    
    redirect_to patients_path, notice: "Estado del paciente #{@patient.status_text.downcase}."
  end
  
  private
  
  def set_patient
    @patient = Patient.find(params[:id])
  end
  
  def patient_params
    params.require(:patient).permit(
      :first_name, :last_name, :email, :phone, :birth_date,
      :address, :city, :state, :zip_code,
      :emergency_contact, :emergency_phone,
      :insurance_provider, :insurance_number,
      :notes, :active
    )
  end
end