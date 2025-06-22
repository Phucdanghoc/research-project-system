require "test_helper"

class DefensesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get defenses_index_url
    assert_response :success
  end

  test "should get show" do
    get defenses_show_url
    assert_response :success
  end

  test "should get create" do
    get defenses_create_url
    assert_response :success
  end

  test "should get update" do
    get defenses_update_url
    assert_response :success
  end

  test "should get destroy" do
    get defenses_destroy_url
    assert_response :success
  end
end
