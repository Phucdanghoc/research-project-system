module Api
  module V1
    class LecturerDefensesController < ApplicationController
      before_action :authenticate_api_user!
      before_action :authorize_admin!, only: [:create, :update, :destroy]
      before_action :set_lecturer_defense, only: [:show, :update, :destroy]

      # GET /lecturer_defenses/me
      def me
        unless current_user.lecturer?
          return render json: { error: "Only lecturers can access their defenses." }, status: :forbidden
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10
        key = params[:key]

        lecturer_defenses = LecturerDefense
                              .includes(:defense)
                              .where(lecturer_id: current_user.id)

        if key.present?
          if key.to_i.to_s == key # key là số nguyên
            lecturer_defenses = lecturer_defenses.where(defense_id: key.to_i)
          else
            lecturer_defenses = lecturer_defenses.joins(:defense).where("defenses.name ILIKE ?", "%#{key}%")
          end
        end

        paginated = lecturer_defenses.page(page).per(per_page)

        render json: {
          lecturer_defenses: paginated.as_json(
            include: {
              defense: {
              }
            }
          ),
          current_page: paginated.current_page,
          total_pages: paginated.total_pages,
          total_count: paginated.total_count
        }, status: :ok
      end
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
