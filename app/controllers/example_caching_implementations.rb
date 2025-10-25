# Example: app/controllers/patients_controller_with_caching.rb
# This shows how to integrate caching into your existing PatientsController

# class PatientsController < ApplicationController
#   include HttpCacheable
#
#   # Cache GET requests for 15 minutes
#   cache_control 15.minutes, 'public'
#   # Disable caching for write operations
#   no_cache_on_write
#
#   def index
#     @q = Patient.ransack(params[:q])
#     search_term = @q.name_cont
#
#     # Use cached search
#     if search_term.present?
#       @patients = Patient.search_cached(search_term, expires_in: 10.minutes)
#     else
#       @patients = Patient.all_cached(expires_in: 15.minutes)
#     end
#
#     # Pagination after cache
#     @patients = Kaminari.paginate_array(@patients).page(params[:page]).per(10)
#
#     respond_to do |format|
#       format.html
#       format.turbo_stream
#     end
#   end
#
#   def show
#     @patient = Patient.find_cached(params[:id], expires_in: 30.minutes)
#     set_cache_headers(30.minutes)
#   end
#
#   def new
#     disable_cache_on_write
#     @patient = Patient.new
#   end
#
#   def create
#     disable_cache_on_write
#     @patient = Patient.new(patient_params)
#     if @patient.save
#       # Cache is automatically invalidated by after_save hook
#       redirect_to @patient, notice: 'Patient created'
#     else
#       render :new
#     end
#   end
#
#   def edit
#     disable_cache_on_write
#     @patient = Patient.find_cached(params[:id])
#   end
#
#   def update
#     disable_cache_on_write
#     @patient = Patient.find(params[:id])
#     if @patient.update(patient_params)
#       # Cache is automatically invalidated by after_update hook
#       redirect_to @patient, notice: 'Patient updated'
#     else
#       render :edit
#     end
#   end
#
#   def destroy
#     disable_cache_on_write
#     @patient = Patient.find(params[:id])
#     @patient.destroy
#     # Cache is automatically invalidated by after_destroy hook
#     redirect_to patients_path, notice: 'Patient deleted'
#   end
#
#   private
#
#   def patient_params
#     params.require(:patient).permit(:first_name, :last_name, :email, :phone, :dni, :birth_date, :city, :state, :active)
#   end
# end

# Example: API endpoint with caching

# module Api
#   module V1
#     class PatientsController < Api::V1::BaseController
#       def index
#         # Set HTTP cache headers
#         response.headers['Cache-Control'] = 'public, max-age=900'  # 15 minutes
#
#         # Cache serialized response
#         @patients = CacheManager.fetch(
#           'api/v1/patients/all',
#           expires_in: 15.minutes
#         ) do
#           Patient.all.includes(:prescriptions).to_a
#         end
#
#         render json: {
#           patients: ActiveModelSerializers::SerializableResource.new(
#             @patients,
#             each_serializer: PatientSerializer
#           )
#         }
#       end
#
#       def show
#         response.headers['Cache-Control'] = 'public, max-age=1800'  # 30 minutes
#
#         @patient = CacheManager.fetch(
#           'api/v1/patient',
#           params[:id],
#           expires_in: 30.minutes
#         ) do
#           Patient.find(params[:id])
#         end
#
#         render json: {
#           patient: PatientSerializer.new(@patient)
#         }
#       end
#
#       def create
#         response.headers['Cache-Control'] = 'no-cache, no-store'
#
#         @patient = Patient.new(patient_params)
#         if @patient.save
#           render json: { patient: PatientSerializer.new(@patient) }, status: :created
#         else
#           render json: { errors: @patient.errors }, status: :unprocessable_entity
#         end
#       end
#
#       def update
#         response.headers['Cache-Control'] = 'no-cache, no-store'
#
#         @patient = Patient.find(params[:id])
#         if @patient.update(patient_params)
#           render json: { patient: PatientSerializer.new(@patient) }
#         else
#           render json: { errors: @patient.errors }, status: :unprocessable_entity
#         end
#       end
#
#       def destroy
#         response.headers['Cache-Control'] = 'no-cache, no-store'
#
#         @patient = Patient.find(params[:id])
#         @patient.destroy
#         head :no_content
#       end
#     end
#   end
# end

puts "This file contains example implementations. Uncomment and adapt to your needs."
