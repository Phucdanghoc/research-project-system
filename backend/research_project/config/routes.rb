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
      # Other resources
      resources :users do
        collection do
          post :import_csv
          get :search
        end
      end
      post 'users/verify_token', to: 'users#verify_token'
      resources :groups
      resources :topics do
        collection do
          get :search
          get :filter_by_status
        end
      end
      resources :defenses

    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
