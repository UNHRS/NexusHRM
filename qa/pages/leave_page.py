from datetime import date, timedelta
from selenium.webdriver.common.by import By
from .base_page import BasePage


class LeavePage(BasePage):
    def submit_leave(self, reason):
        self.open("/employee/leave")
        start = date.today() + timedelta(days=20)
        end = start + timedelta(days=1)
        self.set_date("leave-start-input", start.isoformat())
        self.set_date("leave-end-input", end.isoformat())
        self.by_test_id("leave-reason-input").send_keys(reason)
        self.click_test_id("leave-submit-button")
        self.text_contains(reason)
        self.text_contains("PENDING")

    def set_date(self, test_id, value):
        element = self.by_test_id(test_id)
        self.driver.execute_script(
            "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
            element,
            value,
        )

    def approve_reason(self, reason):
        self.open("/manager/leave-approvals")
        row = self.wait.until(lambda driver: driver.find_element(By.XPATH, f"//tr[contains(., '{reason}')]"))
        row.find_element(By.XPATH, ".//button[contains(., 'Approve')]").click()
        self.wait.until(lambda driver: reason not in driver.find_element(By.TAG_NAME, "body").text)

    def reject_reason(self, reason):
        self.open("/manager/leave-approvals")
        row = self.wait.until(lambda driver: driver.find_element(By.XPATH, f"//tr[contains(., '{reason}')]"))
        row.find_element(By.XPATH, ".//button[contains(., 'Reject')]").click()
        self.wait.until(lambda driver: reason not in driver.find_element(By.TAG_NAME, "body").text)
