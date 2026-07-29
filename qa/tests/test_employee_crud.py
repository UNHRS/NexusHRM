from qa.pages.employee_page import EmployeePage
from qa.pages.login_page import LoginPage


def test_admin_employee_crud(driver, base_url, admin_user):
    LoginPage(driver, base_url).login(**admin_user)
    page = EmployeePage(driver, base_url)
    page.open_admin_employees()
    page.add_employee("QA Test Employee", "qa.employee@nexushrm.local", "QA Analyst")
    page.edit_designation("QA Test Employee", "Senior QA Analyst")
    page.delete_employee("QA Test Employee")


def test_employee_cannot_access_admin_employee_page(driver, base_url, employee_user):
    LoginPage(driver, base_url).login(**employee_user)
    page = EmployeePage(driver, base_url)
    page.open_admin_employees()
    page.current_path_contains("/employee")
