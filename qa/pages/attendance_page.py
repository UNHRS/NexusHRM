from .base_page import BasePage


class AttendancePage(BasePage):
    def open_dashboard(self):
        self.open("/employee")

    def check_in(self):
        self.click_test_id("check-in-button")
        self.text_contains("Checked in")

    def check_out(self):
        self.click_test_id("check-out-button")
        self.text_contains("Checked in")

    def open_history(self):
        self.open("/employee/attendance")
        self.by_test_id("attendance-table")
