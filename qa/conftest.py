import os
import re
import shutil
import subprocess
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
    chromium_binary = shutil.which("chromium-browser") or shutil.which("chromium") or shutil.which("google-chrome")
    if chromium_binary:
        options.binary_location = chromium_binary
    if os.getenv("HEADLESS", "true").lower() == "true":
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,1000")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver_version = os.getenv("CHROMEDRIVER_VERSION") or local_chrome_major(chromium_binary)
    manager = ChromeDriverManager(driver_version=driver_version) if driver_version else ChromeDriverManager()
    browser = webdriver.Chrome(service=Service(manager.install()), options=options)
    yield browser
    browser.quit()


def local_chrome_major(binary):
    if not binary:
        return None
    try:
        output = subprocess.check_output([binary, "--version"], text=True).strip()
    except (OSError, subprocess.SubprocessError):
        return None
    match = re.search(r"(\d+)\.", output)
    return match.group(1) if match else None


@pytest.fixture
def admin_user():
    return {"username": "admin", "password": "password123"}


@pytest.fixture
def manager_user():
    return {"username": "manager.recruitment", "password": "password123"}


@pytest.fixture
def employee_user():
    return {"username": "employee.aasha", "password": "password123"}
