module Api
  module V1
    class GroupsController < ApplicationController
      before_action :authenticate_api_user!
      before_action :set_group, only: [:show, :update, :destroy, :add_students]

      # GET /groups
      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @groups = Group
                    .includes(:lecturer, :defense, :students)
                    .order(created_at: :desc)
                    .page(page)
                    .per(per_page)

        render json: {
          groups: @groups.as_json(include: {
            lecturer: { only: [:id, :name, :faculty] },
            defense: {},
            students: {},
            topics: {},
            student_lead: { only: [:id, :name, :student_code] }
          }),
          current_page: @groups.current_page,
          total_pages: @groups.total_pages,
          total_count: @groups.total_count
        }, status: :ok
      end

      # GET /groups/search?keyword=...
      def search
        keyword = params[:keyword]
        return render json: { error: "Keyword is required." }, status: :bad_request if keyword.blank?

        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @groups = Group
                    .includes(:lecturer, :defense, :students)
                    .where("groups.name ILIKE ?", "%#{keyword}%")
                    .order(created_at: :desc)
                    .page(page)
                    .per(per_page)

        render json: {
          groups: @groups.as_json(include: {
            lecturer: { only: [:id, :name, :faculty] },
            defense: {},
            students: {},
            topics: {},
            student_lead: { only: [:id, :name, :student_code] }
          }),
          current_page: @groups.current_page,
          total_pages: @groups.total_pages,
          total_count: @groups.total_count
        }, status: :ok
      end

      # GET /groups/:id
      def show
        render json: @group.as_json(include: {
          lecturer: {},
          defense: {},
          students: {},
          topics: {},
          student_lead: { only: [:id, :name, :student_code] }
        }), status: :ok
      end

      # POST /groups
      def create
        topic = Topic.find_by(id: params[:topic_id])
        return render json: { error: "Topic not found." }, status: :not_found if topic.nil?

        if current_user.lecturer? && topic.lecturer_id != current_user.id
          return render json: { error: "You can only create groups for your own topics." }, status: :forbidden
        end

        student_ids = Array(params[:student_ids]).map(&:to_i)

        # Create group
        @group = Group.new(
          name: params[:name],
          lecturer_id: topic.lecturer_id,
          description: params[:description]
        )
        @group.topics << topic

        if current_user.student?
          student_ids << current_user.id unless student_ids.include?(current_user.id)
          @group.student_lead_id = current_user.id
        end

        @group.student_ids = student_ids.uniq if student_ids.any?

        if @group.save
          render json: {
            message: "Group successfully created.",
            group: @group.as_json(include: {
              lecturer: { only: [:id, :name, :faculty] },
              defense: {},
              students: {},
              topics: {},
              student_lead: { only: [:id, :name, :student_code] }
            })
          }, status: :created
        else
          render json: { errors: @group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /groups/:id
      def update
        if current_user.lecturer?
          unless @group.topics.first&.lecturer_id == current_user.id
            return render json: { error: "You can only update groups for your own topics." }, status: :forbidden
          end
        elsif current_user.student?
          unless current_user.id == @group.student_lead_id
            return render json: { error: "Only the group leader can update the group." }, status: :forbidden
          end

          student_ids = Array(group_params[:student_ids]).map(&:to_i)
          student_ids << current_user.id unless student_ids.include?(current_user.id)

          valid_ids = User.where(id: student_ids, role: :student).pluck(:id)
          invalid_ids = student_ids - valid_ids
          if invalid_ids.any?
            return render json: { error: "Invalid student IDs: #{invalid_ids.join(', ')}" }, status: :unprocessable_entity
          end

          # ✅ This updates both student_ids and name/description
          if @group.update(group_params.merge(student_ids: valid_ids.uniq))
            return render json: {
              message: "Group successfully updated.",
              group: @group.as_json(include: {
                lecturer: { only: [:id, :name, :faculty] },
                students: {},
                topics: {},
                student_lead: { only: [:id, :name, :student_code] }
              })
            }, status: :ok
          else
            return render json: { errors: @group.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # fallback for lecturer
        if @group.update(group_params)
          render json: {
            message: "Group successfully updated.",
            group: @group.as_json(include: {
              lecturer: { only: [:id, :name, :faculty] },
              students: {},
              topics: {},
              student_lead: { only: [:id, :name, :student_code] }
            })
          }, status: :ok
        else
          render json: { errors: @group.errors.full_messages }, status: :unprocessable_entity
        end
      end


      # DELETE /groups/:id
      def destroy
        if current_user.lecturer?
          unless @group.topics.first&.lecturer_id == current_user.id
            return render json: { error: "You can only delete groups for your own topics." }, status: :forbidden
          end
        end

        @group.destroy
        render json: { message: "Group successfully destroyed." }, status: :ok
      end

      # POST /groups/:id/add_students
      def add_students
        if current_user.lecturer? && @group.topics.first.lecturer_id != current_user.id
          return render json: { error: "You can only add students to your own groups." }, status: :forbidden
        end

        student_ids = params[:student_ids]
        return render json: { error: "Student IDs are required." }, status: :bad_request if student_ids.blank?

        valid_student_ids = User.where(id: student_ids, role: :student).pluck(:id)
        invalid_ids = student_ids.map(&:to_i) - valid_student_ids

        if invalid_ids.any?
          return render json: { error: "The following IDs are invalid or not students: #{invalid_ids.join(', ')}" }, status: :unprocessable_entity
        end

        @group.student_ids |= valid_student_ids
        if @group.save
          render json: {
            message: "Students successfully added.",
            group: @group.as_json(include: {
              lecturer: { only: [:id, :name, :faculty] },
              students: {},
              topics: {},
              student_lead: { only: [:id, :name, :student_code] }
            })
          }, status: :ok
        else
          render json: { errors: @group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_group
        @group = Group.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Group not found." }, status: :not_found
      end

      def group_params
        params.require(:group).permit(:name, :lecturer_id, :defense_id, :topic_id, :description, student_ids: [])
      end
    end
  end
end
