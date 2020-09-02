import unittest
from appium import webdriver
import os


class BaseTest(unittest.TestCase):
    """Basis for all tests."""
    def setUp(self):
        """Sets up desired capabilities and the Appium driver."""
        url = 'http://127.0.0.1:4723/wd/hub'
        desired_caps = {}

        """
        The following desired capabilities must be set when running locally.
        Make sure they are NOT set when uploading to Device Farm.

        desired_caps['platformName'] = 'Android'
        desired_caps['deviceName'] = 'aPhone'
        """

        self.driver = webdriver.Remote(url, desired_caps)

    def tearDown(self):
        """Shuts down the driver."""
        self.driver.quit()





