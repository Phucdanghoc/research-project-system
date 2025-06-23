Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      
      # Devise routes under /api/v1/users
      devise_for :users,
                  path: 'users',
                  path_names: {
                    sign_in: 'login',
                    sign_out: 'logout',
                    registration: 'signup'
                  },
                  controllers: {
                    sessions: 'api/v1/users/sessions',
                    registrations: 'api/v1/users/registrations'
                  }

      # Custom verify_token under /api/v1/users/verify_token
      get 'users/verify_token', to: 'users/sessions#verify_token'

      # Other resources
      resources :users do
        collection do
          post :import_csv
        end
      end

      resources :groups
      resources :topics
      resources :defenses

    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
