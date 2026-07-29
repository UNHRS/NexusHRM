import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture
def base_url():
    return os.getenv("BASE_URL", "http://localhost:5173")


@pytest.fixture
def driver():
    options = Options()
    if os.getenv("HEADLESS", "true").lower() == "true":
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,1000")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    browser = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    yield browser
    browser.quit()


@pytest.fixture
def admin_user():
    return {"username": "admin", "password": "password123"}


@pytest.fixture
def manager_user():
    return {"username": "manager.recruitment", "password": "password123"}


@pytest.fixture
def employee_user():
    return {"username": "employee.aasha", "password": "password123"}
