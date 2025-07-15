module Api
  module V1
    class LecturerDefensesController < ApplicationController
      before_action :authenticate_api_user!
      before_action :authorize_admin!, only: [:create, :update]
      before_action :set_lecturer_defense, only: [:show, :update, :destroy]

      # GET /lecturer_defenses
      def index
        if params[:defense_id]
          @lecturer_defenses = LecturerDefense.includes(:lecturer).where(defense_id: params[:defense_id])
        else
          @lecturer_defenses = LecturerDefense.includes(:lecturer, :defense).all
        end

        render json: @lecturer_defenses.as_json(
          include: { lecturer: { only: [:id, :name, :email] }, defense: { only: [:id, :name, :defense_code] } }
        )
      end

      # GET /lecturer_defenses/:id
      def show
        render json: @lecturer_defense.as_json(
          include: { lecturer: { only: [:id, :name, :email] }, defense: { only: [:id, :name, :defense_code] } }
        )
      end

      # POST /lecturer_defenses
      def create
        @lecturer_defense = LecturerDefense.new(lecturer_defense_params)
        if @lecturer_defense.save
          render json: { message: "Lecturer assigned to defense successfully.", lecturer_defense: @lecturer_defense }, status: :created
        else
          render json: { errors: @lecturer_defense.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /lecturer_defenses/:id
      def update
        if @lecturer_defense.update(lecturer_defense_params)
          render json: { message: "Lecturer defense updated successfully.", lecturer_defense: @lecturer_defense }, status: :ok
        else
          render json: { errors: @lecturer_defense.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /lecturer_defenses/:id
      def destroy
        @lecturer_defense.destroy
        render json: { message: "Lecturer removed from defense." }, status: :ok
      end

      private

      def set_lecturer_defense
        @lecturer_defense = LecturerDefense.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "LecturerDefense not found." }, status: :not_found
      end

      def lecturer_defense_params
        params.require(:lecturer_defense).permit(:defense_id, :lecturer_id, :point, :comment)
      end

      def authorize_admin!
        render json: { error: "Not authorized" }, status: :forbidden unless current_user.admin?
      end
    end
  end
end
