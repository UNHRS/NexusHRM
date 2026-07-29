from qa.pages.dashboard_page import DashboardPage
from qa.pages.leave_page import LeavePage
from qa.pages.login_page import LoginPage


def test_leave_approve_workflow(driver, base_url, employee_user, manager_user):
    reason = "QA approval workflow"
    LoginPage(driver, base_url).login(**employee_user)
    LeavePage(driver, base_url).submit_leave(reason)
    DashboardPage(driver, base_url).logout()
    LoginPage(driver, base_url).login(**manager_user)
    LeavePage(driver, base_url).approve_reason(reason)
    DashboardPage(driver, base_url).logout()
    LoginPage(driver, base_url).login(**employee_user)
    driver.get(f"{base_url}/employee/leave")
    LeavePage(driver, base_url).text_contains("APPROVED")


def test_leave_reject_workflow(driver, base_url, employee_user, manager_user):
    reason = "QA reject workflow"
    LoginPage(driver, base_url).login(**employee_user)
    LeavePage(driver, base_url).submit_leave(reason)
    DashboardPage(driver, base_url).logout()
    LoginPage(driver, base_url).login(**manager_user)
    LeavePage(driver, base_url).reject_reason(reason)
    DashboardPage(driver, base_url).logout()
    LoginPage(driver, base_url).login(**employee_user)
    driver.get(f"{base_url}/employee/leave")
    LeavePage(driver, base_url).text_contains("REJECTED")
