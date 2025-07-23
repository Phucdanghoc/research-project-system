module Api
  module V1
    class PlansController < ApplicationController
      before_action :authenticate_api_user!
      before_action :authorize_admin!
      before_action :set_plan, only: [:show, :update, :destroy]

      # GET /plans
      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        plans = Plan
                  .includes(:group, :defense)
                  .order(date: :asc, start_time: :asc)
                  .page(page)
                  .per(per_page)

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
        render json: @plan.as_json(include: {
          group: { only: [:id, :name] },
          defense: { only: [:id, :name, :defense_code] }
        }, only: [:id, :date, :start_time, :end_time]), status: :ok
      end

      # POST /plans
      def create
        plan = Plan.new(plan_params)
        if plan.save
          plan.group.update(def_status: :approved) if plan.group.present?

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
