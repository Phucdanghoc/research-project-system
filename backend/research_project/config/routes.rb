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

      # User routes
      resources :users do
        collection do
          post :import_csv
          get :search
          
          # New role-based routes
          get :students
          get 'students/search', action: :search_students
          
          get :lecturers
          get 'lecturers/search', action: :search_lecturers
          get 'students/faculty', to: 'users#students_by_faculty'
        end
      end
      get "topics/filter_by_category", to: "topics#filter_by_category"
      post 'users/verify_token', to: 'users#verify_token'
      post "topics/generate", to: "topics#generate_topics"
      get "topics/lecturer/:id", to: "topics#search_by_lecturer"

      # Other resources
      resources :groups do
        member do
          post :add_students
        end
        collection do
          get :search
        end
      end
      resources :topics do
        collection do
          get :search
          get :filter_by_status
        end
      end
      resources :defenses do
        collection do
          get :search
        end
      end
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
