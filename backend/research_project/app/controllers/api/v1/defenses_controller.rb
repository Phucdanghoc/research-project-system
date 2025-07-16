module Api
  module V1
    class DefensesController < ApplicationController
      before_action :authenticate_api_user!
      before_action :set_defense, only: [:show, :update, :destroy]
      before_action :authorize_admin!, only: [:create, :update, :destroy]

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
        render json: @defense.to_json(include: {
          groups: {
            include: [:lecturer, :students]
          }
        })
      end

      def create
        @defense = Defense.new(defense_params.except(:lecturer_ids))
        if @defense.save
          if params[:defense][:lecturer_ids].present?
            lecturer_ids = params[:defense][:lecturer_ids].map(&:to_i)
            lecturer_ids.each do |lecturer_id|
              LecturerDefense.create(lecturer_id: lecturer_id, defense_id: @defense.id)
            end
          end

          render json: { message: "Defense successfully created.", defense: @defense }, status: :created
        else
          render json: { errors: @defense.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @defense.update(defense_params.except(:lecturer_ids))
          if params[:defense][:lecturer_ids].present?
            @defense.lecturer_defenses.where.not(lecturer_id: params[:defense][:lecturer_ids]).destroy_all

            new_ids = params[:defense][:lecturer_ids].map(&:to_i)
            current_ids = @defense.lecturer_defenses.pluck(:lecturer_id)
            (new_ids - current_ids).each do |lecturer_id|
              LecturerDefense.create(lecturer_id: lecturer_id, defense_id: @defense.id)
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
        params.require(:defense).permit(:name, :status, lecturer_ids: [])
      end
    end
  end
end
