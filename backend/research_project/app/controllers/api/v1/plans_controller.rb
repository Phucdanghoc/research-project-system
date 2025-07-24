module Api
  module V1
    class PlansController < ApplicationController
      before_action :authenticate_api_user!
      before_action :authorize_admin!, only: [:create, :update, :check_time, :destroy]
      before_action :set_plan, only: [:show, :update, :destroy]

      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        plans = Plan.includes(:group, :defense)

        date = nil
        if params[:date].present?
          begin
            date = Date.parse(params[:date])
            plans = plans.where(date: date)
          rescue ArgumentError => e
            Rails.logger.error "Invalid date: #{params[:date]} | Error: #{e.message}"
            return render json: { error: "Invalid date format. Use YYYY-MM-DD." }, status: :bad_request
          end
        end

        if params[:start_time].present? && date
          begin
            start_time_str = "#{params[:date]} #{params[:start_time]}"
            local_start = Time.zone.parse(start_time_str)
            utc_start = local_start&.utc&.strftime("%H:%M:%S")
            if utc_start
              plans = plans.where("CAST(start_time AS time) >= ?", utc_start)
            else
              Rails.logger.error "Parsed start_time is nil from input: #{start_time_str}"
              return render json: { error: "Invalid start_time format." }, status: :bad_request
            end
          rescue ArgumentError => e
            Rails.logger.error "Invalid start_time: #{params[:start_time]} | Error: #{e.message}"
            return render json: { error: "Invalid start_time format. Use HH:MM." }, status: :bad_request
          end
        end

        if params[:end_time].present? && date
          begin
            end_time_str = "#{params[:date]} #{params[:end_time]}"
            local_end = Time.strptime(end_time_str, "%Y-%m-%d %H:%M").in_time_zone("Asia/Ho_Chi_Minh")
            utc_end = local_end.utc.strftime("%H:%M:%S")

            plans = plans.where("CAST(end_time AS time) <= ?", utc_end)
          rescue ArgumentError => e
            Rails.logger.error "Invalid end_time: #{params[:end_time]} | Error: #{e.message}"
            return render json: { error: "Invalid end_time format. Use HH:MM." }, status: :bad_request
          end
        end
        plans = plans.order(date: :asc, start_time: :asc)
                    .page(page).per(per_page)

        render json: {
          plans: plans.as_json(include: {
            group: { only: [:id, :name] },
            defense: { only: [:id, :name, :defense_code] }
          }, only: [:id, :date, :start_time, :end_time]),
          current_page: plans.current_page,
          total_pages: plans.total_pages,
          total_count: plans.total_count
        }, status: :ok
      end


      # GET /plans/me
      def me
        user = current_user

        if user.student?
          plans = Plan.joins(group: :students)
                      .where(users: { id: user.id })
                      .includes(:group, :defense)
        elsif user.lecturer?
          plans = Plan.joins(group: :lecturer)
                      .where(groups: { lecturer_id: user.id })
                      .includes(:group, :defense)

          # Filter by defense key
          if params[:key].present?
            key = params[:key]
            if key.to_i.to_s == key
              plans = plans.where(defense_id: key.to_i)
            else
              plans = plans.joins(:defense).where(
                "defenses.name ILIKE ? OR defenses.defense_code ILIKE ?", "%#{key}%", "%#{key}%"
              )
            end
          end

          # Filter by date
          date = nil
          if params[:date].present?
            begin
              date = Date.parse(params[:date])
              plans = plans.where(date: date)
            rescue ArgumentError => e
              Rails.logger.error "Invalid date: #{params[:date]} | Error: #{e.message}"
              return render json: { error: "Invalid date format. Use YYYY-MM-DD." }, status: :bad_request
            end
          end

          # Filter by time
          if params[:start_time].present? && date
            begin
              local_start = Time.zone.parse("#{params[:date]} #{params[:start_time]}")
              utc_start = local_start.utc.strftime("%H:%M:%S")
              plans = plans.where("CAST(start_time AS time) >= ?", utc_start)
            rescue ArgumentError => e
              Rails.logger.error "Invalid start_time: #{params[:start_time]} | Error: #{e.message}"
              return render json: { error: "Invalid start_time format. Use HH:MM." }, status: :bad_request
            end
          end

          if params[:end_time].present? && date
            begin
              local_end = Time.zone.parse("#{params[:date]} #{params[:end_time]}")
              utc_end = local_end.utc.strftime("%H:%M:%S")
              plans = plans.where("CAST(end_time AS time) <= ?", utc_end)
            rescue ArgumentError => e
              Rails.logger.error "Invalid end_time: #{params[:end_time]} | Error: #{e.message}"
              return render json: { error: "Invalid end_time format. Use HH:MM." }, status: :bad_request
            end
          end
        else
          return render json: { error: "Only students and lecturers can access this resource." }, status: :forbidden
        end

        plans = plans.order(date: :asc, start_time: :asc)
                    .page(params[:page] || 1).per(params[:per_page] || 10)

        render json: {
          plans: plans.as_json(include: {
            group: { only: [:id, :name] },
            defense: { only: [:id, :name, :defense_code] }
          }, only: [:id, :date, :start_time, :end_time]),
          current_page: plans.current_page,
          total_pages: plans.total_pages,
          total_count: plans.total_count
        }, status: :ok
      end





      # GET /plans/:id
      def show
        render json: @plan.as_json(
          only: [:id, :date, :start_time, :end_time],
          include: {
            group: {
              only: [:id, :name, :group_code, :description],
              include: {
                lecturer: { only: [:id, :name, :email, :faculty] },
                students: { only: [:id, :name, :email, :student_code] },
                topics: { only: [:id, :title, :topic_code] }
              }
            },
            defense: {
              only: [:id, :name, :defense_code],
              include: {
                lecturer_defenses: {
                  include: {
                    lecturer: { only: [:id, :name, :email, :lecturer_code] }
                  },
                  only: [:id, :point, :comment]
                }
              }
            }
          }
        ), status: :ok
      end

      # POST /plans
      def create
        plan = Plan.new(plan_params)
        
        if plan.save
          if plan.group.present?
            plan.group.update(defense_id: plan.defense_id, def_status: :approved)
          end

          render json: { message: "Plan created successfully.", plan: plan }, status: :created
        else
          render json: { errors: plan.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /plans/:id
      def update
        if @plan.update(plan_params)
          render json: { message: "Plan updated successfully.", plan: @plan }, status: :ok
        else
          render json: { errors: @plan.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /plans/:id
      def destroy
        @plan.destroy
        render json: { message: "Plan deleted successfully." }, status: :ok
      end

      # GET /plans/check_time
      def check_time
        lecturer_id = params[:lecturer_id]
        date_str = params[:date]
        start_str = params[:start_time]
        end_str = params[:end_time]

        if lecturer_id.blank? || start_str.blank? || end_str.blank? || date_str.blank?
          return render json: { error: "lecturer_id, start_time, end_time, and date are required." }, status: :bad_request
        end

        begin
          date = Date.parse(date_str)
          local_start = Time.zone.parse("#{date_str} #{start_str}")
          local_end = Time.zone.parse("#{date_str} #{end_str}")
          utc_start = local_start.utc.strftime("%H:%M:%S")
          utc_end = local_end.utc.strftime("%H:%M:%S")
        rescue ArgumentError => e
          Rails.logger.error "Invalid input in check_time | Error: #{e.message}"
          return render json: { error: "Invalid time or date format." }, status: :bad_request
        end

        overlapping_plans = Plan
          .joins(group: :lecturer)
          .where(groups: { lecturer_id: lecturer_id }, date: date)
          .where("(start_time, end_time) OVERLAPS (?::time, ?::time)", utc_start, utc_end)

        if overlapping_plans.exists?
          render json: {
            conflict: true,
            plans: overlapping_plans.as_json(include: {
              group: { only: [:id, :name] },
              defense: { only: [:id, :name, :defense_code] }
            }, only: [:id, :date, :start_time, :end_time])
          }, status: :ok
        else
          render json: { conflict: false }, status: :ok
        end
      end



      private

      def set_plan
        @plan = Plan.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Plan not found." }, status: :not_found
      end

      def authorize_admin!
        render json: { error: "Not authorized." }, status: :forbidden unless current_user.admin?
      end

      def plan_params
        params.require(:plan).permit(:group_id, :defense_id, :date, :start_time, :end_time)
      end
    end
  end
end
