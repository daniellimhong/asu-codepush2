# List Appium Test
from base_test import BaseTest

class ExampleTest(BaseTest):
  def test_pass(self):
    # print('testing')
    # time.sleep(5)
    # button = self.driver.find_element_by_accessibility_id('clickHereButton')
    # button.click()
    # time.sleep(5)
    # assert self.driver.find_element_by_accessibility_id('successText')
    assert True

  def test_fail(self):
    button = self.driver.find_element_by_accessibility_id('clickHereButton')