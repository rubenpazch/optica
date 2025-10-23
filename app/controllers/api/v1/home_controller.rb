class Api::V1::HomeController < Api::V1::BaseController
  # GET /api/v1/dashboard
  def dashboard
    stats = {
      total_patients: Patient.count,
      active_patients: Patient.active.count,
      inactive_patients: Patient.inactive.count,
      recent_patients: Patient.order(created_at: :desc).limit(5).as_json(include: [ :user ])
    }

    render json: { dashboard: stats }
  end

  # GET /api/v1/current_user
  def current_user
    user = super  # Call Devise's current_user method
    render json: {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    }
  end
end
