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
      get 'users/profile', to: 'users#profile'
      get 'users/lecturer/plans/me', to: 'users#plans_me'
      resources :users do
        collection do
          post :import_csv
          get :search
          
          # New role-based routes
          get :students
          get 'students/search', action: :search_students
          
          get :lecturers
          get 'lecturers/search', action: :search_lecturers
          get 'students/my-faculty', action: :students_my_faculty
          get 'me'
          get 'topic/me', action: :topic_me
          get 'groups/me', to: 'users#groups_me'
        end
      end

      post 'users/verify_token', to: 'users#verify_token'
      post 'users/reset-password', to: 'users#reset_password'
      post 'users/change-password', to: 'users#change_password'
      
      get "topics/filter_by_category", to: "topics#filter_by_category"
      post "topics/generate", to: "topics#generate_topics"
      get "topics/lecturer/:id", to: "topics#search_by_lecturer"
      get 'topics/faculty_me', to: 'topics#faculty_me'
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
          get :me
        end
      end
      resources :plans do
        collection do
          get :check_time
        end
      end
      get 'defenses/me', to: 'defenses#my_defense'
      get 'defenses/check-time', to: 'defenses#check_time'
      resources :defenses do
        collection do
          get :search
        end
      end
      resources :lecturer_defenses, only: [:index, :show, :create, :update, :destroy]
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
