from qa.pages.dashboard_page import DashboardPage
from qa.pages.login_page import LoginPage


def test_login_admin(driver, base_url, admin_user):
    LoginPage(driver, base_url).login(**admin_user)
    DashboardPage(driver, base_url).assert_admin()


def test_login_manager(driver, base_url, manager_user):
    LoginPage(driver, base_url).login(**manager_user)
    DashboardPage(driver, base_url).assert_manager()


def test_login_employee(driver, base_url, employee_user):
    LoginPage(driver, base_url).login(**employee_user)
    DashboardPage(driver, base_url).assert_employee()


def test_invalid_password_shows_error(driver, base_url, admin_user):
    LoginPage(driver, base_url).login(admin_user["username"], "wrong-password")
    LoginPage(driver, base_url).assert_error()
    assert "/login" in driver.current_url


def test_logout_blocks_protected_routes(driver, base_url, admin_user):
    LoginPage(driver, base_url).login(**admin_user)
    dashboard = DashboardPage(driver, base_url)
    dashboard.assert_admin()
    dashboard.logout()
    driver.get(f"{base_url}/admin")
    dashboard.current_path_contains("/login")
