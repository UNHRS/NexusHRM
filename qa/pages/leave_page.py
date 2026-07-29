from datetime import date, timedelta
from selenium.webdriver.common.by import By
from .base_page import BasePage


class LeavePage(BasePage):
    def submit_leave(self, reason):
        self.open("/employee/leave")
        start = date.today() + timedelta(days=20)
        end = start + timedelta(days=1)
        self.by_test_id("leave-start-input").send_keys(start.isoformat())
        self.by_test_id("leave-end-input").send_keys(end.isoformat())
        self.by_test_id("leave-reason-input").send_keys(reason)
        self.click_test_id("leave-submit-button")
        self.text_contains(reason)
        self.text_contains("PENDING")

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
