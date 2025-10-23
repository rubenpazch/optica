Rails.application.routes.draw do
  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication routes (will be handled by devise-jwt)
      devise_for :users,
        path: "",
        path_names: {
          sign_in: "users/sign_in",
          sign_out: "users/sign_out",
          registration: "users"
        },
        controllers: {
          sessions: "api/v1/sessions",
          registrations: "api/v1/registrations"
        }

      # API endpoints
      get "dashboard", to: "home#dashboard"
      get "current_user", to: "home#current_user"

      resources :patients do
        member do
          post :toggle_status
        end
      end
    end
  end

  # Health check endpoint for load balancers and uptime monitors
  get "up" => "rails/health#show", as: :rails_health_check

  # Root route - serve React app
  root "application#fallback_index_html"

  # Catch-all route for React frontend (SPA)
  # This should serve the React index.html for any non-API routes
  get "*path", to: "application#fallback_index_html", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end
end
