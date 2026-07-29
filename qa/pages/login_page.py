from .base_page import BasePage


class LoginPage(BasePage):
    def login(self, username, password):
        self.open("/login")
        self.by_test_id("username-input").clear()
        self.by_test_id("username-input").send_keys(username)
        self.by_test_id("password-input").clear()
        self.by_test_id("password-input").send_keys(password)
        self.click_test_id("login-button")
        self.wait.until(lambda driver: "/login" not in driver.current_url or "Invalid username or password" in driver.find_element("tag name", "body").text)

    def assert_error(self):
        self.text_contains("Invalid username or password")
