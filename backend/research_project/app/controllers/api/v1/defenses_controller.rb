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
      def search
        keyword = params[:keyword]

        if keyword.blank?
          return render json: { error: "Keyword is required." }, status: :bad_request
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @defenses = Defense
                      .includes(groups: [:lecturer, :students])
                      .where("defenses.name ILIKE ?", "%#{keyword}%")
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
      def show
        render json: @defense.to_json(include: {
          groups: {
            include: [:lecturer, :students]
          }
        })
      end

      def create
        @defense = Defense.new(defense_params)
        if @defense.save
          render json: { message: "Defense successfully created.", defense: @defense }, status: :created
        else
          render json: { errors: @defense.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @defense.update(defense_params)
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
        params.require(:defense).permit(:name, :defenseTime, :status)
      end
    end
  end
end