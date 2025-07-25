module Api
  module V1
    class DefensesController < ApplicationController
      before_action :authenticate_api_user!
      before_action :set_defense, only: [:show, :update, :destroy]
      before_action :authorize_admin!, only: [:create, :update, :destroy]


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

        conflicts = LecturerDefense.where(lecturer_id: lecturer_id, date: parsed_date)
          .where.not("start_time >= ? OR end_time <= ?", parsed_end, parsed_start)

        if conflicts.any?
          render json: {
            conflict: true,
            message: "Time conflict detected with existing schedules.",
            conflicts: conflicts.as_json(only: [:id, :date, :start_time, :end_time, :group_id])
          }, status: :ok
        else
          render json: { conflict: false, message: "No conflict detected." }, status: :ok
        end
      end

      # GET /defenses/my_schedule
      def my_schedule
        unless current_user.lecturer?
          return render json: { error: "Only lecturers can access their defenses." }, status: :forbidden
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10
        key = params[:key]
        search_date = params[:date]
        search_start_time = params[:start_time]
        search_end_time = params[:end_time]

        defenses = LecturerDefense
                    .includes(:defense, :group)
                    .where(lecturer_id: current_user.id)

        if key.present?
          if key.to_i.to_s == key
            defenses = defenses.where(defense_id: key.to_i)
          else
            defenses = defenses.joins(:defense).where("defenses.name ILIKE ?", "%#{key}%")
          end
        end

        defenses = defenses.where(date: search_date) if search_date.present?

        if search_start_time.present?
          begin
            parsed_time = Time.parse(search_start_time).strftime("%H:%M")
            defenses = defenses.where("TO_CHAR(start_time, 'HH24:MI') = ?", parsed_time)
          rescue ArgumentError
            return render json: { error: "Invalid start_time format. Use HH:MM" }, status: :bad_request
          end
        end

        if search_end_time.present?
          begin
            parsed_time = Time.parse(search_end_time).strftime("%H:%M")
            defenses = defenses.where("TO_CHAR(end_time, 'HH24:MI') = ?", parsed_time)
          rescue ArgumentError
            return render json: { error: "Invalid end_time format. Use HH:MM" }, status: :bad_request
          end
        end

        paginated = defenses.order(date: :asc, start_time: :asc).page(page).per(per_page)

        render json: {
          lecturer_defenses: paginated.as_json(
            include: {
              defense: { only: [:id, :name, :defense_code] },
              group: { only: [:id, :name, :group_code] }
            },
            except: [:created_at, :updated_at]
          ),
          current_page: paginated.current_page,
          total_pages: paginated.total_pages,
          total_count: paginated.total_count
        }, status: :ok
      end


      # GET /defenses/me
      def me
        unless current_user.lecturer?
          return render json: { error: "Only lecturers can access this resource." }, status: :forbidden
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10

        # Get defense_ids assigned to this lecturer
        defense_ids = LecturerDefense.where(lecturer_id: current_user.id).pluck(:defense_id).uniq

        defenses = Defense
                    .includes(:groups => [:lecturer, :students], :lecturer_defenses => [:lecturer, :group])
                    .where(id: defense_ids)
                    .order(created_at: :desc)
                    .page(page)
                    .per(per_page)

        render json: {
          defenses: defenses.as_json(
            only: [:id, :name, :defense_code, :status, :created_at],
            include: {
              groups: {
                only: [:id, :name, :group_code, :lecturer_id],
                include: {
                  lecturer: { only: [:id, :name, :email] },
                  students: { only: [:id, :name, :email] }
                }
              },
              lecturer_defenses: {
                only: [:id, :lecturer_id, :point, :comment, :date, :start_time, :end_time, :group_id],
                include: {
                  lecturer: { only: [:id, :name, :email] },
                  group: { only: [:id, :name, :group_code] }
                }
              }
            }
          ),
          current_page: defenses.current_page,
          total_pages: defenses.total_pages,
          total_count: defenses.total_count
        }, status: :ok
      end

      # GET /defenses
      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @defenses = Defense
                      .includes(groups: [:lecturer, :students])
                      .order(created_at: :desc)
                      .page(page)
                      .per(per_page)

        render json: {
          defenses: @defenses.as_json(include: {
            groups: {
              include: [:lecturer, :students]
            }
          }),
          current_page: @defenses.current_page,
          total_pages: @defenses.total_pages,
          total_count: @defenses.total_count
        }, status: :ok
      end

      # GET /defenses/search
      def search
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        defenses = Defense.includes(groups: [:lecturer, :students]).order(created_at: :desc)

        defenses = defenses.where("defenses.name ILIKE ?", "%#{params[:keyword]}%") if params[:keyword].present?
        defenses = defenses.where(defense_code: params[:defense_code]) if params[:defense_code].present?

        # Note: Removed all time-based filtering here

        paginated = defenses.page(page).per(per_page)

        render json: {
          defenses: paginated.as_json(include: {
            groups: {
              include: [:lecturer, :students]
            }
          }),
          current_page: paginated.current_page,
          total_pages: paginated.total_pages,
          total_count: paginated.total_count
        }, status: :ok
      end

      # GET /defenses/my_defense
      def my_defense
        user = current_user

        defenses =
          if user.student?
            Defense.joins(groups: :students).where(groups: { students: { id: user.id } }).distinct
          elsif user.lecturer?
            Defense
              .left_outer_joins(:groups, :lecturer_defenses)
              .where(
                "groups.lecturer_id = :id OR lecturer_defenses.lecturer_id = :id",
                id: user.id
              ).distinct
          else
            Defense.none
          end

        if defenses.empty?
          render json: { message: "No defense found for current user." }, status: :not_found
        else
          render json: defenses.as_json(include: {
            groups: {
              include: [:lecturer, :students]
            }
          }), status: :ok
        end
      end

      # Removed check_time method entirely (now belongs to PlansController)

      def show
        defense = Defense.includes(:groups, :lecturer_defenses).find_by(id: params[:id])
        return render json: { error: "Defense not found" }, status: :not_found unless defense

        render json: defense.as_json(
          only: [:id, :name, :status, :defense_code],
          include: {
            groups: {
              only: [:id, :name, :group_code, :lecturer_id],
              include: {
                lecturer: { only: [:id, :name, :email] }
              }
            },
            lecturer_defenses: {
              only: [:id, :lecturer_id, :point, :comment, :date, :start_time, :end_time, :group_id],
              include: {
                lecturer: { only: [:id, :name, :email] },
                group: { only: [:id, :name, :group_code] }
              }
            }
          }
        ), status: :ok
      end


      def create
        @defense = Defense.new(defense_params.except(:lecturer_ids, :group_id, :date, :start_time, :end_time))

        if @defense.save
          group = Group.find_by(id: params[:defense][:group_id])
          if group
            group.update(defense_id: @defense.id)

            # Parse shared time values
            date = params[:defense][:date]
            start_time = params[:defense][:start_time]
            end_time = params[:defense][:end_time]

            # Tạo các LecturerDefense và gán group_id + thời gian
            if params[:defense][:lecturer_ids].present?
              lecturer_ids = params[:defense][:lecturer_ids].map(&:to_i)
              lecturer_ids.each do |lecturer_id|
                ld = LecturerDefense.new(
                  lecturer_id: lecturer_id,
                  defense_id: @defense.id,
                  group_id: group.id,
                  date: date,
                  start_time: Time.zone.parse(start_time),
                  end_time: Time.zone.parse(end_time)
                )

                unless ld.save
                  Rails.logger.error "❌ Failed to create LecturerDefense for lecturer_id #{lecturer_id}: #{ld.errors.full_messages.join(', ')}"
                end
              end
            end
          end

          render json: { message: "Defense successfully created.", defense: @defense }, status: :created
        else
          render json: { errors: @defense.errors.full_messages }, status: :unprocessable_entity
        end
      end


      def update
        if @defense.update(defense_params.except(:lecturer_ids, :group_id, :date, :start_time, :end_time))
          # Cập nhật group nếu group_id mới được truyền
          if params[:defense][:group_id].present?
            group = Group.find_by(id: params[:defense][:group_id])
            group&.update(defense_id: @defense.id)
          else
            group = @defense.groups.first # fallback nếu không có group_id mới
          end

          # Parse thời gian nếu có
          date = params[:defense][:date]
          start_time = params[:defense][:start_time]
          end_time = params[:defense][:end_time]

          if params[:defense][:lecturer_ids].present?
            new_ids = params[:defense][:lecturer_ids].map(&:to_i)
            current_ids = @defense.lecturer_defenses.pluck(:lecturer_id)

            # Xóa những lecturer_defense không còn
            @defense.lecturer_defenses.where.not(lecturer_id: new_ids).destroy_all

            # Tạo mới nếu chưa có
            (new_ids - current_ids).each do |lecturer_id|
              LecturerDefense.create(
                lecturer_id: lecturer_id,
                defense_id: @defense.id,
                group_id: group&.id,
                date: date,
                start_time: Time.zone.parse(start_time),
                end_time: Time.zone.parse(end_time)
              )
            end

            # Cập nhật thời gian cho các lecturer_defense đã tồn tại
            (new_ids & current_ids).each do |lecturer_id|
              ld = @defense.lecturer_defenses.find_by(lecturer_id: lecturer_id)
              if ld
                ld.update(
                  group_id: group&.id,
                  date: date,
                  start_time: Time.zone.parse(start_time),
                  end_time: Time.zone.parse(end_time)
                )
              end
            end
          end

          render json: { message: "Defense successfully updated.", defense: @defense }, status: :ok
        else
          render json: { errors: @defense.errors.full_messages }, status: :unprocessable_entity
        end
      end


      def destroy
        @defense.destroy
        render json: { message: "Defense successfully destroyed." }, status: :ok
      end

      private

      def authorize_admin!
        unless current_user.admin?
          render json: { error: "Not authorized to perform this action." }, status: :forbidden
        end
      end

      def set_defense
        @defense = Defense.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Defense not found." }, status: :not_found
      end

      def defense_params
        params.require(:defense).permit(
          :name, :status, :group_id, :date, :start_time, :end_time,
          lecturer_ids: []
        )
      end
    end
  end
end
