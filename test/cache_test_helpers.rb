# test/test_helper.rb additions for cache testing

# Add these helpers to your existing test_helper.rb:

module CacheTestHelpers
  def assert_cache_hit(key)
    assert Rails.cache.exist?(key), "Expected cache key #{key} to exist"
  end

  def assert_cache_miss(key)
    assert_not Rails.cache.exist?(key), "Expected cache key #{key} to not exist"
  end

  def assert_cached_value(key, expected_value)
    cached = Rails.cache.read(key)
    assert_equal expected_value, cached, "Expected #{key} to contain #{expected_value}, got #{cached}"
  end

  def clear_test_cache
    Rails.cache.clear
  end

  def cached_keys_matching(pattern)
    if Rails.cache.respond_to?(:delete_matched)
      # This is a workaround - actual keys depend on cache store implementation
      Rails.logger.info("Matching pattern: #{pattern}")
    end
  end
end

class ActiveSupport::TestCase
  include CacheTestHelpers

  setup do
    # Clear cache before each test
    Rails.cache.clear if Rails.cache.respond_to?(:clear)
  end

  teardown do
    # Clear cache after each test
    Rails.cache.clear if Rails.cache.respond_to?(:clear)
  end
end

class ActionController::TestCase
  include CacheTestHelpers
end

class ActionDispatch::IntegrationTest
  include CacheTestHelpers
end
