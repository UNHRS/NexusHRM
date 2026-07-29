from selenium.webdriver.common.by import By
from .base_page import BasePage


class EmployeePage(BasePage):
    def open_admin_employees(self):
        self.open("/admin/employees")

    def add_employee(self, name, email, designation):
        self.by_test_id("employee-name-input").send_keys(name)
        self.by_test_id("employee-email-input").send_keys(email)
        self.by_test_id("employee-designation-input").send_keys(designation)
        department = self.by_test_id("employee-department-select")
        department.find_elements(By.TAG_NAME, "option")[1].click()
        self.by_test_id("employee-username-input").send_keys(email.split("@")[0])
        self.click_test_id("employee-save-button")
        self.text_contains(name)

    def edit_designation(self, name, designation):
        row = self.driver.find_element(By.XPATH, f"//tr[contains(., '{name}')]")
        row.find_element(By.XPATH, ".//button[contains(., 'Edit')]").click()
        field = self.by_test_id("employee-designation-input")
        field.clear()
        field.send_keys(designation)
        self.click_test_id("employee-save-button")
        self.text_contains(designation)

    def delete_employee(self, name):
        self.driver.execute_script("window.confirm = () => true")
        row = self.driver.find_element(By.XPATH, f"//tr[contains(., '{name}')]")
        row.find_element(By.XPATH, ".//button[contains(., 'Delete')]").click()
        self.wait.until(lambda driver: name not in driver.find_element(By.TAG_NAME, "body").text)
