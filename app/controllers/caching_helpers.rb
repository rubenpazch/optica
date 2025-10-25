# app/controllers/application_controller.rb (additions for caching)

# Add these helpers to your existing ApplicationController:

module CachingHelpers
  extend ActiveSupport::Concern

  included do
    helper_method :cache_available?
    helper_method :cache_stats
  end

  def cache_available?
    !Rails.cache.is_a?(ActiveSupport::Cache::NullStore)
  end

  def cache_stats
    if cache_available? && Rails.cache.respond_to?(:stats)
      Rails.cache.stats
    else
      {}
    end
  end

  # Disable caching for write operations
  def disable_cache_on_write
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
  end

  # Set cache headers for GET operations
  def set_cache_headers(max_age = 15.minutes, visibility = 'public')
    response.headers['Cache-Control'] = "#{visibility}, max-age=#{max_age.to_i}"
    response.headers['Vary'] = 'Accept-Encoding, Accept-Language'
  end

  protected

  # Log cache operations
  def log_cache_operation(action, key, hit: false)
    status = hit ? 'HIT' : 'MISS'
    Rails.logger.info("[CACHE #{status}] #{action}: #{key}") if cache_available?
  end
end
