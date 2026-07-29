from qa.pages.attendance_page import AttendancePage
from qa.pages.login_page import LoginPage


def test_employee_check_in_out_and_history(driver, base_url, employee_user):
    LoginPage(driver, base_url).login(**employee_user)
    page = AttendancePage(driver, base_url)
    page.open_dashboard()
    if page.by_test_id("check-in-button").is_enabled():
        page.check_in()
    if page.by_test_id("check-out-button").is_enabled():
        page.check_out()
    page.open_history()
    page.text_contains("PRESENT")
