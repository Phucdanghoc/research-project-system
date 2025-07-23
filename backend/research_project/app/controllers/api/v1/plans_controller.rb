module Api
  module V1
    class PlansController < ApplicationController
      before_action :authenticate_api_user!
      before_action :authorize_admin!, only: [:create, :update, :destroy]
      before_action :set_plan, only: [:show, :update, :destroy]

      # GET /plans
      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        plans = Plan.includes(:group, :defense)

        # Filter by date or start_time/end_time datetime
        if params[:start_time].present? && params[:end_time].present?
          begin
            parsed_start = Time.parse(params[:start_time])
            parsed_end = Time.parse(params[:end_time])
            date = parsed_start.to_date

            plans = plans.where(date: date)
                        .where("(plans.start_time, plans.end_time) OVERLAPS (?::time, ?::time)",
                                parsed_start.strftime("%H:%M:%S"), parsed_end.strftime("%H:%M:%S"))
          rescue ArgumentError
            return render json: { error: "Invalid start_time or end_time format. Use ISO 8601." }, status: :bad_request
          end
        elsif params[:date].present?
          begin
            date = Date.parse(params[:date])
            plans = plans.where(date: date)
          rescue ArgumentError
            return render json: { error: "Invalid date format. Use YYYY-MM-DD." }, status: :bad_request
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
                      .order(date: :asc, start_time: :asc)
        elsif user.lecturer?
          plans = Plan.joins(group: :lecturer)
                      .where(groups: { lecturer_id: user.id })
                      .includes(:group, :defense)
                      .order(date: :asc, start_time: :asc)

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

          # Filter by start_time and end_time (ISO8601)
          if params[:start_time].present? && params[:end_time].present?
            begin
              parsed_start = Time.parse(params[:start_time])
              parsed_end = Time.parse(params[:end_time])

              plans = plans.where(
                "(plans.date + plans.start_time)::timestamp, (plans.date + plans.end_time)::timestamp OVERLAPS (?, ?)",
                parsed_start, parsed_end
              )
            rescue ArgumentError
              return render json: { error: "Invalid time format." }, status: :bad_request
            end
          elsif params[:date].present?
            begin
              date = Date.parse(params[:date])
              plans = plans.where(date: date)
            rescue ArgumentError
              return render json: { error: "Invalid date format. Use YYYY-MM-DD." }, status: :bad_request
            end
          end

          # Pagination
          page = params[:page] || 1
          per_page = params[:per_page] || 10
          plans = plans.page(page).per(per_page)
        else
          return render json: { error: "Only students and lecturers can access this resource." }, status: :forbidden
        end

        render json: {
          plans: plans.as_json(include: {
            group: { only: [:id, :name] },
            defense: { only: [:id, :name, :defense_code] }
          }, only: [:id, :date, :start_time, :end_time]),
          current_page: plans.respond_to?(:current_page) ? plans.current_page : nil,
          total_pages: plans.respond_to?(:total_pages) ? plans.total_pages : nil,
          total_count: plans.respond_to?(:total_count) ? plans.total_count : plans.size
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
        start_time = params[:start_time]
        end_time = params[:end_time]
        date = params[:date]

        if lecturer_id.blank? || start_time.blank? || end_time.blank? || date.blank?
          return render json: { error: "lecturer_id, start_time, end_time, and date are required." }, status: :bad_request
        end

        begin
          parsed_start = Time.parse(start_time)
          parsed_end = Time.parse(end_time)
          parsed_date = Date.parse(date)
        rescue ArgumentError
          return render json: { error: "Invalid time or date format." }, status: :bad_request
        end

        overlapping_plans = Plan
          .joins(group: :lecturer)
          .where(groups: { lecturer_id: lecturer_id }, date: parsed_date)
          .where("(plans.start_time, plans.end_time) OVERLAPS (?::time, ?::time)", parsed_start.strftime("%H:%M:%S"), parsed_end.strftime("%H:%M:%S"))

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
