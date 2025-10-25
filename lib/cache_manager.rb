# lib/cache_manager.rb

class CacheManager
  # Cache duration constants
  DURATIONS = {
    very_short:  5.minutes,
    short:      15.minutes,
    medium:     30.minutes,
    long:        1.hour,
    very_long:   1.day
  }.freeze

  # Cache key prefixes
  PREFIXES = {
    user:         'user',
    patient:      'patient',
    prescription: 'prescription',
    search:       'search',
    api:          'api'
  }.freeze

  class << self
    # Generate cache key with prefix and parameters
    def key(*args)
      parts = args.map(&:to_s)
      "#{parts.join('/')}"
    end

    # Cache with automatic key generation
    def fetch(prefix, id = nil, duration = DURATIONS[:medium], &block)
      cache_key = id ? "#{prefix}/#{id}" : prefix
      Rails.cache.fetch(cache_key, expires_in: duration, &block)
    end

    # Delete cache by pattern
    def delete(prefix, id = nil)
      if id
        Rails.cache.delete("#{prefix}/#{id}")
      else
        Rails.cache.delete_matched("#{prefix}/*")
      end
    end

    # Clear entire cache store
    def clear!
      Rails.cache.clear
    end

    # Warm cache with common queries
    def warm_cache!
      # Load frequently accessed data into cache
      User.all_cached
      Patient.all_cached
      
      Rails.logger.info("Cache warmed at #{Time.current}")
    end

    # Get cache statistics
    def stats
      if Rails.cache.respond_to?(:stats)
        Rails.cache.stats
      else
        "Cache statistics not available for #{Rails.cache.class}"
      end
    end

    # Delete expired entries (useful for cleanup)
    def cleanup!
      Rails.cache.cleanup if Rails.cache.respond_to?(:cleanup)
      Rails.logger.info("Cache cleanup completed at #{Time.current}")
    end

    # List all cache keys (development only)
    def list_keys(pattern = '*')
      if Rails.env.development?
        Rails.cache.delete_matched(pattern, return_deleted_count: true)
        # Note: delete_matched with return_deleted_count only returns count in some stores
        # For full key listing, you'd need to implement store-specific logic
      end
    end
  end
end
