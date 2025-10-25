# lib/tasks/cache.rake

namespace :cache do
  desc "Clear all caches"
  task clear: :environment do
    Rails.cache.clear
    puts "✓ All caches cleared"
  end

  desc "Warm up caches with common queries"
  task warm: :environment do
    CacheManager.warm_cache!
    puts "✓ Caches warmed up"
  end

  desc "Display cache statistics"
  task stats: :environment do
    stats = CacheManager.stats
    if stats.is_a?(Hash)
      puts "Cache Statistics:"
      stats.each { |key, value| puts "  #{key}: #{value}" }
    else
      puts stats
    end
  end

  desc "Clean up expired cache entries"
  task cleanup: :environment do
    CacheManager.cleanup!
    puts "✓ Cache cleanup completed"
  end

  desc "Display cache info"
  task info: :environment do
    puts "Cache Store: #{Rails.cache.class}"
    puts "Rails Environment: #{Rails.env}"
    puts "Cache Version: #{ENV.fetch('CACHE_VERSION', '1')}"
  end

  # Advanced tasks for redis-cache-store
  namespace :redis do
    desc "Connect to Redis cache store (redis only)"
    task connect: :environment do
      if Rails.cache.respond_to?(:redis)
        redis = Rails.cache.redis
        puts "✓ Connected to Redis at #{redis.config[:url]}"
        puts "  Keys: #{redis.dbsize}"
      else
        puts "✗ Redis not configured"
      end
    end

    desc "Monitor Redis cache usage"
    task monitor: :environment do
      if Rails.cache.respond_to?(:redis)
        redis = Rails.cache.redis
        info = redis.info('memory')
        puts "Redis Memory Usage:"
        puts "  Used: #{info['used_memory_human']}"
        puts "  Peak: #{info['used_memory_peak_human']}"
        puts "  Allocated: #{info['total_system_memory_human']}"
      else
        puts "✗ Redis not configured"
      end
    end
  end
end
