from .base_page import BasePage


class DashboardPage(BasePage):
    def assert_admin(self):
        self.current_path_contains("/admin")
        self.by_test_id("admin-dashboard")

    def assert_manager(self):
        self.current_path_contains("/manager")
        self.by_test_id("manager-dashboard")

    def assert_employee(self):
        self.current_path_contains("/employee")
        self.by_test_id("employee-dashboard")

    def logout(self):
        self.click_test_id("logout-button")
        self.current_path_contains("/login")
