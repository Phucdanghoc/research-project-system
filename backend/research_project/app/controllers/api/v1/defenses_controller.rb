module Api
  module V1
    class DefensesController < ApplicationController
      before_action :authenticate_api_user!
      before_action :set_defense, only: [:show, :update, :destroy]
      before_action :authorize_admin!, only: [:create, :update, :destroy]

      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10
        key = params[:key]
        status = params[:status]

        defenses = Defense.includes(:groups).order(created_at: :desc)
        defenses = defenses.where("defenses.name ILIKE ?", "%#{key}%") if key.present?
        defenses = defenses.where(status: status) if status.present?

        paginated = defenses.page(page).per(per_page)

        render json: {
          defenses: paginated.as_json(include: {
            groups: { }
          }),
          current_page: paginated.current_page,
          total_pages: paginated.total_pages,
          total_count: paginated.total_count
        }, status: :ok
      end

      def show
        render json: @defense.as_json(include: {
          groups: { only: [:id, :name, :group_code] },
          lecturer_defenses: {
            include: {
              lecturer: { only: [:id, :name, :email] },
              group: { only: [:id, :name, :group_code] }
            },
            only: [:id, :lecturer_id, :point, :comment, :group_id, :date, :start_time, :end_time]
          }
        })
      end

      def me
        user = current_user

        defenses =
          if user.student?
            Defense.joins(groups: :students).where(groups: { students: { id: user.id } }).distinct
          elsif user.lecturer?
            Defense
              .left_outer_joins(:groups, :lecturer_defenses)
              .where("lecturer_defenses.lecturer_id = :id", id: user.id).distinct
          else
            Defense.none
          end

        if defenses.empty?
          render json: { message: "No defense found for current user." }, status: :not_found
        else
          render json: defenses.as_json(include: {
            groups: { include: [:lecturer, :students] },
            lecturer_defenses: {
              include: {
                lecturer: { only: [:id, :name, :email] },
                group: { only: [:id, :name, :group_code] }
              },
              only: [:id, :lecturer_id, :point, :comment, :group_id, :date, :start_time, :end_time]
            }
          }), status: :ok
        end
      end

      # GET /defenses/check_time_conflict
      def check_time_conflict
        lecturer_id = params[:lecturer_id]
        date = params[:date]
        start_time = params[:start_time]
        end_time = params[:end_time]

        if lecturer_id.blank? || date.blank? || start_time.blank? || end_time.blank?
          return render json: { error: "Missing required parameters: lecturer_id, date, start_time, end_time" }, status: :bad_request
        end

        begin
          parsed_date = Date.parse(date)
          parsed_start = Time.zone.parse(start_time)
          parsed_end = Time.zone.parse(end_time)
        rescue ArgumentError
          return render json: { error: "Invalid time or date format. Use YYYY-MM-DD and HH:MM" }, status: :bad_request
        end
        conflicts = Defense.where(date: parsed_date)
          .where.not("start_time >= ? OR end_time <= ?", parsed_end, parsed_start)

        if conflicts.any?
          render json: {
            conflict: true,
            message: "Time conflict detected with existing schedules.",
            conflicts: conflicts.as_json(only: [:id, :date, :start_time, :end_time, :name, :defense_code])
          }, status: :ok
        else
          render json: { conflict: false, message: "No conflict detected." }, status: :ok
        end
      end

      # POST /defenses
      def create
        @defense = Defense.new(defense_params.except(:lecturer_ids, :group_ids))

        if @defense.save
          if params[:defense][:group_ids].present?
            params[:defense][:group_ids].each do |gid|
              group = Group.find_by(id: gid)
              if group
                group.update(defense_id: @defense.id, status: :accepted)
                group.update(defense_id: @defense.id, def_status: :approved)  
              end
            end
          end

          if params[:defense][:lecturer_ids].present? && params[:defense][:group_ids].present?
            lecturer_ids = params[:defense][:lecturer_ids].map(&:to_i)
            params[:defense][:group_ids].each do |gid|
              lecturer_ids.each do |lecturer_id|
                existing = LecturerDefense.find_by(lecturer_id: lecturer_id, defense_id: @defense.id)
                if existing.nil?
                  LecturerDefense.create(
                    lecturer_id: lecturer_id,
                    defense_id: @defense.id,
                    group_id: gid
                  )
                else
                  existing.update(group_id: gid)
                end
              end
            end
          end

          render json: { message: "Defense successfully created.", defense: @defense }, status: :created
        else
          render json: { errors: @defense.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /defenses/:id
      def update
        if @defense.update(defense_params.except(:lecturer_ids, :group_ids))
          if params[:defense][:group_ids].present?
            params[:defense][:group_ids].each do |gid|
              group = Group.find_by(id: gid)
              group&.update(defense_id: @defense.id)
            end
          end

          if params[:defense][:lecturer_ids].present? && params[:defense][:group_ids].present?
            new_ids = params[:defense][:lecturer_ids].map(&:to_i)
            current_ids = @defense.lecturer_defenses.pluck(:lecturer_id)

            @defense.lecturer_defenses.where.not(lecturer_id: new_ids).destroy_all

            params[:defense][:group_ids].each do |gid|
              (new_ids - current_ids).each do |lecturer_id|
                LecturerDefense.create(
                  lecturer_id: lecturer_id,
                  defense_id: @defense.id,
                  group_id: gid
                )
              end

              (new_ids & current_ids).each do |lecturer_id|
                ld = @defense.lecturer_defenses.find_by(lecturer_id: lecturer_id)
                ld.update(group_id: gid) if ld
              end
            end
          end

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

      def authorize_admin!
        render json: { error: "Not authorized to perform this action." }, status: :forbidden unless current_user.admin?
      end

      def set_defense
        @defense = Defense.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Defense not found." }, status: :not_found
      end

      def defense_params
        params.require(:defense).permit(:name, :status, :date, :start_time, :end_time, group_ids: [], lecturer_ids: [])
      end
    end
  end
end
