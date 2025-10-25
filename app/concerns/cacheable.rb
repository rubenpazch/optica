# app/concerns/cacheable.rb

module Cacheable
  extend ActiveSupport::Concern

  included do
    after_update :invalidate_cache
    after_destroy :invalidate_cache
  end

  class_methods do
    def cache_key_prefix
      name.underscore.pluralize
    end

    def find_cached(id, expires_in: 30.minutes)
      cache_key = "#{cache_key_prefix}/#{id}"
      Rails.cache.fetch(cache_key, expires_in: expires_in) do
        find(id)
      end
    end

    def all_cached(expires_in: 1.hour)
      cache_key = "#{cache_key_prefix}/all"
      Rails.cache.fetch(cache_key, expires_in: expires_in) do
        all.to_a
      end
    end

    def where_cached(conditions, expires_in: 30.minutes)
      cache_key = "#{cache_key_prefix}/where/#{Digest::MD5.hexdigest(conditions.to_s)}"
      Rails.cache.fetch(cache_key, expires_in: expires_in) do
        where(conditions).to_a
      end
    end

    def clear_all_cache
      Rails.cache.delete_matched("#{cache_key_prefix}/*")
    end
  end

  def invalidate_cache
    self.class.clear_all_cache
    Rails.cache.delete("#{self.class.cache_key_prefix}/#{id}")
  end

  def self.clear_all_caches
    # Clear all application caches
    User.clear_all_cache
    Patient.clear_all_cache
    # Add more models as needed
  end
end
