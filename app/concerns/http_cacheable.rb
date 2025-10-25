# app/concerns/http_cacheable.rb

module HttpCacheable
  extend ActiveSupport::Concern

  class_methods do
    # Set Cache-Control header for GET requests
    def cache_control(max_age = 15.minutes, visibility = 'public')
      before_action only: [:index, :show] do
        response.headers['Cache-Control'] = "#{visibility}, max-age=#{max_age.to_i}"
      end
    end

    # Disable caching for write operations
    def no_cache_on_write
      before_action only: [:create, :update, :destroy] do
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Expires'] = '0'
      end
    end
  end

  included do
    # Helper to set ETag
    def set_etag(object)
      response.set_header('ETag', "\"#{Digest::MD5.hexdigest(object.to_json)}\"")
    end

    # Helper to set Last-Modified
    def set_last_modified(object)
      if object.respond_to?(:updated_at)
        response.set_header('Last-Modified', object.updated_at.httpdate)
      end
    end

    # Helper to check conditional requests
    def fresh_when(record)
      if stale?(record)
        yield if block_given?
      else
        head :not_modified
      end
    end
  end
end
