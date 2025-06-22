Rails.application.routes.draw do
  get "defenses/index"
  get "defenses/show"
  get "defenses/create"
  get "defenses/update"
  get "defenses/destroy"
  get "topics/index"
  get "topics/show"
  get "topics/create"
  get "topics/update"
  get "topics/destroy"
  get "users/create"
  devise_for :users,
              path: 'users',
              path_names: {
                sign_in: 'login',
                sign_out: 'logout',
                registration: 'signup'
              },
              controllers: {
                sessions: 'users/sessions',
                registrations: 'users/registrations'
              }
  resources :users do
    collection do
      post :import_csv
    end
  end
  resources :groups
  resources :topics
  resources :defenses
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check


  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
