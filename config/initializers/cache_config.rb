# config/initializers/cache_config.rb

# Cache configuration for all environments
Rails.application.config.after_initialize do
  # Set cache key version to auto-invalidate on deploy
  Rails.cache.class_eval do
    def cache_version
      @cache_version ||= Rails.root.join('CACHE_VERSION').read.strip rescue '1'
    end
  end

  # Development cache warming helper
  if Rails.env.development?
    Rails.logger.debug("Cache store configured: #{Rails.cache.class}")
  end

  # Production cache monitoring
  if Rails.env.production?
    # Log cache statistics periodically (optional)
    # Implement with sidekiq or similar job scheduler
  end
end

# Add cache helper methods to Rails.logger
module CacheLogging
  def cache_hit(key)
    info("Cache HIT: #{key}")
  end

  def cache_miss(key)
    info("Cache MISS: #{key}")
  end

  def cache_invalidated(key)
    info("Cache INVALIDATED: #{key}")
  end
end

Rails.logger.extend(CacheLogging)
