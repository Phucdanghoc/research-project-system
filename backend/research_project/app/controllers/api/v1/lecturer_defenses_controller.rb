module Api
  module V1
    class LecturerDefensesController < ApplicationController
      before_action :authenticate_api_user!
      before_action :authorize_lecturer_or_admin!
      before_action :set_lecturer_defense, only: [:create, :update, :destroy]

      # GET /lecturer_defenses
      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10
        key = params[:key]

        defenses = LecturerDefense.includes(:lecturer, :defense, :group)

        # Filter by defense_id
        defenses = defenses.where(defense_id: params[:defense_id]) if params[:defense_id].present?

        # Filter by date
        defenses = defenses.where(date: params[:date]) if params[:date].present?

        # Filter by start_time
        if params[:start_time].present?
          begin
            start_time = Time.parse(params[:start_time])
            defenses = defenses.where(start_time: start_time)
          rescue ArgumentError
            return render json: { error: "Invalid start_time format. Use HH:MM" }, status: :bad_request
          end
        end

        # Filter by end_time
        if params[:end_time].present?
          begin
            end_time = Time.parse(params[:end_time])
            defenses = defenses.where(end_time: end_time)
          rescue ArgumentError
            return render json: { error: "Invalid end_time format. Use HH:MM" }, status: :bad_request
          end
        end

        # Filter by key in defense name
        if key.present?
          defenses = defenses.joins(:defense).where("defenses.name ILIKE ?", "%#{key}%")
        end

        paginated = defenses.order(created_at: :desc).page(page).per(per_page)

        render json: {
          lecturer_defenses: paginated.as_json(
            include: {
              lecturer: { only: [:id, :name, :email] },
              defense: { only: [:id, :name, :defense_code] },
              group: { only: [:id, :name, :group_code] }
            }
          ),
          current_page: paginated.current_page,
          total_pages: paginated.total_pages,
          total_count: paginated.total_count
        }, status: :ok
      end

      # POST /lecturer_defenses
      def create
        @lecturer_defense = LecturerDefense.new(lecturer_defense_params)
        group = @lecturer_defense.group

        # Prevent assigning defense if group is already linked to another defense
        if group && group.defense_id.present? && group.defense_id != @lecturer_defense.defense_id
          return render json: { error: "Group is already linked to a different defense." }, status: :conflict
        end

        if @lecturer_defense.save
          # Auto-link group to defense if not set
          if group && group.defense_id.nil?
            group.update(defense_id: @lecturer_defense.defense_id)
          end

          render json: {
            message: "Lecturer assigned to defense successfully.",
            lecturer_defense: @lecturer_defense
          }, status: :created
        else
          render json: { errors: @lecturer_defense.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      # PATCH /lecturer_defenses/update_score_by_group
      def update_score_by_group
        unless current_user.lecturer?
          return render json: { error: "Only lecturers can update their scores." }, status: :forbidden
        end

        group_id = params[:group_id]
        point = params[:point]
        comment = params[:comment]

        if group_id.blank?
          return render json: { error: "group_id is required" }, status: :bad_request
        end

        lec_def = LecturerDefense.find_by(lecturer_id: current_user.id, group_id: group_id)

        unless lec_def
          return render json: { error: "No record found for current lecturer and group" }, status: :not_found
        end

        if lec_def.update(point: point, comment: comment)
          render json: {
            message: "Score updated successfully",
            lecturer_defense: lec_def.as_json(only: [:id, :group_id, :point, :comment])
          }, status: :ok
        else
          render json: { errors: lec_def.errors.full_messages }, status: :unprocessable_entity
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
        @lecturer_defense = LecturerDefense.find_by(id: params[:id])
        render json: { error: "LecturerDefense not found." }, status: :not_found unless @lecturer_defense
      end

      def lecturer_defense_params
        params.require(:lecturer_defense).permit(
          :lecturer_id, :defense_id, :group_id,
          :point, :comment,
          :date, :start_time, :end_time
        )
      end

      def authorize_lecturer_or_admin!
        unless current_user.admin? || current_user.lecturer?
          render json: { error: "Not authorized" }, status: :forbidden
        end
      end
    end
  end
end
