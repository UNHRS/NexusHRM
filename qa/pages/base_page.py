from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class BasePage:
    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 12)

    def open(self, path):
        self.driver.get(f"{self.base_url}{path}")

    def by_test_id(self, test_id):
        return self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f'[data-testid="{test_id}"]')))

    def click_test_id(self, test_id):
        self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, f'[data-testid="{test_id}"]'))).click()

    def text_contains(self, text):
        return self.wait.until(EC.presence_of_element_located((By.XPATH, f"//*[contains(., '{text}')]")))

    def current_path_contains(self, path):
        self.wait.until(lambda driver: path in driver.current_url)
