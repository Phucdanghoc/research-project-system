class DefensesController < ApplicationController
  before_action :authenticate_api_user!  # Devise + JWT authentication
  before_action :set_defense, only: [:show, :update, :destroy]
  before_action :authorize_admin!, only: [:create, :update, :destroy]

  # GET /defenses
  def index
    @defenses = Defense.all.includes(groups: :lecturer)
    render json: @defenses.to_json(include: { groups: { include: :lecturer } })
  end

  # GET /defenses/:id
  def show
    render json: @defense.to_json(include: { groups: { include: :lecturer } })
  end

  # POST /defenses
  def create
    @defense = Defense.new(defense_params)
    if @defense.save
      render json: { message: "Defense successfully created.", defense: @defense }, status: :created
    else
      render json: { errors: @defense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /defenses/:id
  def update
    if @defense.update(defense_params)
      render json: { message: "Defense successfully updated.", defense: @defense }, status: :ok
    else
      render json: { errors: @defense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /defenses/:id
  def destroy
    @defense.destroy
    render json: { message: "Defense successfully destroyed." }, status: :ok
  end

  private

  # Check if the current user is an admin
  def authorize_admin! 
    unless current_user.admin?
      render json: { error: "Not authorized to perform this action." }, status: :forbidden
    end
  end

  # Set defense by id
  def set_defense
    @defense = Defense.find(params[:id])  
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Defense not found." }, status: :not_found
  end

  # Strong parameters for Defense
  def defense_params
    params.require(:defense).permit(:name, :defenseTime, :status)
  end
end
