require 'test/unit'
require 'watir'


class Herstory < Test::Unit::TestCase

  def test_qunit
    browser = Watir::Browser.new
    browser.goto('http://daaku.org:8080/tests/index.html')
    browser.link(:id, 'action').click
    sleep 0.1
    browser.link(:id, 'action').click
    sleep 0.1
    browser.back
    sleep 0.1
    browser.link(:id, 'action').click
    sleep 0.1
    browser.back
    sleep 0.1
    browser.forward
    sleep 0.1
    browser.link(:id, 'action').click
    sleep 0.2
    assert('pass' == browser.h2(:id, 'banner').attribute_value('className'))
  end

end
