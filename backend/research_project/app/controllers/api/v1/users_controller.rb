module Api
  module V1
    class UsersController < ApplicationController
      include UsersHelper

      before_action :authenticate_api_user!
      skip_before_action :authenticate_api_user!, only: [:verify_token]
      before_action :authorize_admin!, only: [
        :create, :index, :update, :import_csv, :destroy,
        :students, :lecturers,
        :search_students, :search_lecturers
      ]
      before_action :set_user, only: [:show, :update]

      def me
        render json: current_user.as_json(include: [:groups, :lecture_groups]), status: :ok
      end

      def topic_me
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        topics = current_user.topics.order(created_at: :desc).page(page).per(per_page)

        render json: {
          topics: topics.as_json,
          current_page: topics.current_page,
          total_pages: topics.total_pages,
          total_count: topics.total_count
        }, status: :ok
      end

      def groups_me
        search = params[:search]
        status = params[:status]
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        groups = current_user.groups + current_user.lecture_groups
        groups = groups.uniq

        if search.present?
          groups = groups.select { |g| g.name.downcase.include?(search.downcase) }
        end

        if status.present?
          groups = groups.select { |g| g.status.to_s == status.to_s }
        end

        # Custom pagination cho mảng
        paginated_groups = Kaminari.paginate_array(groups)
                                  .page(page)
                                  .per(per_page)

        render json: {
          groups: paginated_groups.as_json(include: {
            lecturer: { only: [:id, :name, :faculty] },
            defense: {},
            students: {},
            topics: {}
          }),
          current_page: paginated_groups.current_page,
          total_pages: paginated_groups.total_pages,
          total_count: paginated_groups.total_count
        }, status: :ok
      end


      def students_my_faculty
        faculty = current_user.faculty
        search = params[:search]

        if faculty.blank?
          return render json: { error: "Current user's faculty is not set." }, status: :bad_request
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 10

        students = User.student.where("LOWER(faculty) = ?", faculty.downcase)

        if search.present?
           students = students.where(
              "student_code LIKE :search OR name LIKE :search OR email LIKE :search",
              search: "%#{search}%"
            )
        end

        students = students.includes(:groups, :lecture_groups)
                          .order(created_at: :desc)
                          .page(page).per(per_page)

        render json: {
          users: students.as_json(include: [:groups, :lecture_groups]),
          current_page: students.current_page,
          total_pages: students.total_pages,
          total_count: students.total_count
        }, status: :ok
      end


      def import_csv
        if params[:file].nil?
          return render json: { error: "CSV file is required" }, status: :bad_request
        end

        result = import_users_from_csv(params[:file].path)

        if result[:created_users].any? && result[:errors].empty?
          render json: { message: "All users imported successfully.", count: result[:created_users].size }, status: :created
        elsif result[:created_users].any?
          render json: { message: "Some users imported, some failed.", imported_count: result[:created_users].size, errors: result[:errors] }, status: :multi_status
        elsif result[:errors].any?
          render json: { message: "No users imported. All rows had errors.", errors: result[:errors] }, status: :unprocessable_entity
        else
          render json: { message: "No valid data provided." }, status: :bad_request
        end
      end

      def destroy
        user = User.find_by(id: params[:id])
        return render json: { error: "User not found." }, status: :not_found unless user
        return render json: { error: "Cannot delete admin user." }, status: :forbidden if user.admin?

        user.destroy
        render json: { message: "User successfully deleted." }, status: :ok
      end

      def create
        duplicate_fields = []
        duplicate_fields << "email" if User.exists?(email: user_params[:email])
        duplicate_fields << "phone" if user_params[:phone].present? && User.exists?(phone: user_params[:phone])
        duplicate_fields << "student_code" if user_params[:student_code].present? && User.exists?(student_code: user_params[:student_code])
        duplicate_fields << "lecturer_code" if user_params[:lecturer_code].present? && User.exists?(lecturer_code: user_params[:lecturer_code])

        if duplicate_fields.any?
          return render json: { error: "Duplicate fields detected.", duplicates: duplicate_fields }, status: :conflict
        end

        unless user_params[:password].present?
          return render json: { error: "Password is required." }, status: :unprocessable_entity
        end

        @user = User.new(user_params)

        if @user.save
          token = JsonWebToken.encode(user_id: @user.id, role: @user.role)

          render json: {
            message: "User successfully created.",
            user: @user.as_json(only: [:id, :email, :role, :name, :student_code, :lecturer_code]),
            token: token
          }, status: :created
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def students
        paginated_users(User.student)
      end

      def lecturers
        paginated_users(User.lecturer)
      end

      def index
        paginated_users(User.all)
      end

      def show
        render json: @user.as_json(include: [:groups, :lecture_groups]), status: :ok
      end

      def update
        if @user.update(user_params)
          render json: { message: "User successfully updated.", user: @user }, status: :ok
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def verify_token
        token = params[:token]
        return render json: { valid: false, error: "Token missing" }, status: :ok if token.blank?

        begin
          decoded = JsonWebToken.decode(token)
          user = User.find_by(id: decoded[:user_id]) if decoded&.[](:user_id)
          if user
            render json: { valid: true, user: user.as_json(only: [:id, :email, :role, :name]) }, status: :ok
          else
            render json: { valid: false }, status: :ok
          end
        rescue JWT::ExpiredSignature
          render json: { valid: false, error: "Token expired" }, status: :ok
        rescue JWT::DecodeError
          render json: { valid: false, error: "Invalid token" }, status: :ok
        end
      end

      def search_students
        search_by_role(:student)
      end

      def search_lecturers
        search_by_role(:lecturer)
      end

      private

      def set_user
        @user = User.find_by(id: params[:id])
        render json: { error: "User not found." }, status: :not_found unless @user
      end

      def authorize_admin!
        render json: { error: "Not authorized." }, status: :forbidden unless current_user&.admin?
      end

      def user_params
        params.require(:user).permit(
          :role, :email, :password, :name, :phone, :gender, :birth,
          :student_code, :class_name, :faculty, :major, :lecturer_code
        )
      end

      def is_numeric?(string)
        true if Integer(string) rescue false
      end

      def paginated_users(scope)
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        users = scope.includes(:groups, :lecture_groups).order(created_at: :desc).page(page).per(per_page)

        render json: {
          users: users.as_json(include: [:groups, :lecture_groups]),
          current_page: users.current_page,
          total_pages: users.total_pages,
          total_count: users.total_count
        }, status: :ok
      end

      def search_by_role(role)
        keyword = params[:keyword]
        faculty = params[:faculty]
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        conditions = User.arel_table[:role].eq(User.roles[role])

        if keyword.present?
          keyword_condition = User.arel_table[:name].matches("%#{keyword}%")
          keyword_condition = keyword_condition.or(User.arel_table[:id].eq(keyword.to_i)) if is_numeric?(keyword)
          conditions = conditions.and(keyword_condition)
        end

        if faculty.present?
          conditions = conditions.and(User.arel_table[:faculty].matches("%#{faculty}%"))
        end

        users = User.where(conditions)
                    .includes(:groups, :lecture_groups)
                    .order(created_at: :desc)
                    .page(page).per(per_page)

        render json: {
          users: users.as_json(include: [:groups, :lecture_groups]),
          current_page: users.current_page,
          total_pages: users.total_pages,
          total_count: users.total_count
        }, status: :ok
      end


    end
  end
end
