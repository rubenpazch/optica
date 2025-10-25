# Caching Strategy Implementation Guide

## Current Caching Setup

### Production
- **Cache Store:** `solid_cache_store` (database-backed, persistent)
- **Fragment Caching:** Enabled
- **Asset Caching:** 1 year (static files)

### Development
- **Cache Store:** `:memory_store` (in-process, non-persistent)
- **Fragment Caching:** Optional (toggle with `rails dev:cache`)

## Recommended Caching Strategy

### 1. **Database Query Caching**

Cache frequently accessed data that doesn't change often:

```ruby
# For list of users (cache for 1 hour)
def index
  @users = Rails.cache.fetch("users/all", expires_in: 1.hour) do
    User.all.to_a
  end
end

# For individual user (cache for 30 minutes, invalidate on update)
def show
  @user = Rails.cache.fetch("user/#{params[:id]}", expires_in: 30.minutes) do
    User.find(params[:id])
  end
end
```

### 2. **API Response Caching**

Cache expensive API responses:

```ruby
# GET /api/v1/users - cache list response
def index
  role = params[:role]
  cache_key = "api/v1/users/#{role || 'all'}"
  
  cached_response = Rails.cache.fetch(cache_key, expires_in: 1.hour) do
    users = role.present? ? User.by_role(role) : User.all
    users.map { |u| UserSerializer.new(u).serializable_hash[:data][:attributes] }
  end
  
  render json: { users: cached_response }
end
```

### 3. **Patient Data Caching**

```ruby
# Cache patient lists (short TTL due to frequent changes)
def get_patients
  Rails.cache.fetch("patients/all", expires_in: 15.minutes) do
    Patient.all.to_a
  end
end

# Cache individual patient (with cache busting on update)
def patient_by_id(id)
  Rails.cache.fetch("patient/#{id}", expires_in: 30.minutes) do
    Patient.find(id)
  end
end
```

### 4. **Prescription Caching**

```ruby
# Cache prescription list (medium TTL)
def get_prescriptions
  Rails.cache.fetch("prescriptions/all", expires_in: 20.minutes) do
    Prescription.all.to_a
  end
end

# Cache individual prescription details
def prescription_details(id)
  Rails.cache.fetch("prescription/#{id}", expires_in: 1.hour) do
    Prescription.includes(:patient, :user).find(id)
  end
end
```

## Cache Invalidation Strategy

### Automatic Invalidation

```ruby
# In Patient model
after_update :invalidate_cache
after_destroy :invalidate_cache

def invalidate_cache
  Rails.cache.delete("patients/all")
  Rails.cache.delete("patient/#{id}")
end

# In Prescription model
after_save :invalidate_caches
after_destroy :invalidate_caches

def invalidate_caches
  Rails.cache.delete("prescriptions/all")
  Rails.cache.delete("prescription/#{id}")
  Rails.cache.delete("patient/#{patient_id}")  # Invalidate related patient
end

# In User model
after_update :invalidate_user_cache
after_destroy :invalidate_user_cache

def invalidate_user_cache
  Rails.cache.delete("users/all")
  Rails.cache.delete("user/#{id}")
  Rails.cache.delete("api/v1/users/all")
  Rails.cache.delete("api/v1/users/admin")
  Rails.cache.delete("api/v1/users/sales")
end
```

### Manual Cache Clearing

```ruby
# Clear all caches (useful after maintenance)
Rails.cache.clear

# Clear specific cache entries
Rails.cache.delete("patients/all")
Rails.cache.delete_matched("patient/*")  # Wildcard deletion
```

## HTTP Response Caching Headers

### For Static Assets
```ruby
# Already configured in production.rb
config.public_file_server.headers = { 
  "cache-control" => "public, max-age=#{1.year.to_i}" 
}
```

### For API Endpoints

Add to controllers to enable browser/CDN caching:

```ruby
class Api::V1::PatientsController < Api::V1::BaseController
  def index
    # Cache-Control headers for GET requests
    response.headers["Cache-Control"] = "public, max-age=900"  # 15 minutes
    
    @patients = Rails.cache.fetch("patients/all", expires_in: 15.minutes) do
      Patient.all.to_a
    end
    
    render json: { patients: @patients }
  end

  def show
    # Cache individual resources
    response.headers["Cache-Control"] = "public, max-age=1800"  # 30 minutes
    
    @patient = Rails.cache.fetch("patient/#{params[:id]}", expires_in: 30.minutes) do
      Patient.find(params[:id])
    end
    
    render json: { patient: @patient }
  end

  def create
    # Don't cache write operations
    response.headers["Cache-Control"] = "no-cache, no-store"
    
    @patient = Patient.new(patient_params)
    # ... create logic
  end
end
```

## Fragment Caching (for Views - if using server-side rendering)

```erb
<% cache("user_list", expires_in: 1.hour) do %>
  <% @users.each do |user| %>
    <div class="user">
      <%= user.email %>
      <%= user.role %>
    </div>
  <% end %>
<% end %>
```

## Redis Caching (Advanced - for production scale)

For better performance in production, consider Redis:

```ruby
# Gemfile
gem 'redis'
gem 'redis-rails'

# config/environments/production.rb
config.cache_store = :redis_cache_store, {
  url: ENV.fetch('REDIS_URL', 'redis://127.0.0.1:6379/1'),
  expires_in: 1.day,
  namespace: 'optica_cache',
  race_condition_ttl: 10.seconds  # Prevent cache stampede
}

# Connection pool for better concurrency
config.cache_store = :redis_cache_store, {
  url: ENV.fetch('REDIS_URL'),
  expires_in: 1.day,
  namespace: 'optica_cache',
  pool: { size: 10, timeout: 5 }
}
```

## Caching Best Practices

### ✅ DO

1. **Cache read-heavy data**
   - User lists, role lookups
   - Patient information that changes infrequently
   - Prescription templates

2. **Use appropriate TTLs**
   - Master data: 1 hour
   - Reference data: 1 day
   - Search results: 15 minutes
   - User preferences: 30 minutes

3. **Implement cache invalidation**
   - Invalidate on data changes
   - Use versioning keys
   - Monitor cache hit rates

4. **Cache at multiple levels**
   - Database query results
   - Serialized API responses
   - HTTP response headers

5. **Monitor cache performance**
   - Track cache hit/miss ratios
   - Monitor memory usage
   - Set up alerts for cache issues

### ❌ DON'T

1. **Cache write-intensive data**
   - Real-time data that changes frequently
   - User session data
   - Temporary form data

2. **Cache sensitive information**
   - Passwords (never!)
   - Personal medical data without encryption
   - API credentials

3. **Use too long TTLs**
   - Stale data confuses users
   - Can mask bugs
   - Increases memory usage

4. **Forget about cache invalidation**
   - Stale data is worse than no cache
   - Always invalidate on updates
   - Use automated invalidation

5. **Cache everything**
   - Adds complexity
   - Increases memory usage
   - Not all data benefits from caching

## Performance Impact

### Expected Improvements

| Operation | Before Cache | After Cache | Improvement |
|-----------|--------------|-------------|-------------|
| GET /users | 150ms | 5ms | 30x faster |
| GET /patients | 200ms | 10ms | 20x faster |
| GET /prescriptions | 300ms | 15ms | 20x faster |
| User creation | 100ms | 100ms | (cache invalidated) |

### Monitoring

```ruby
# Check cache statistics
Rails.cache.stats if Rails.cache.respond_to?(:stats)

# Log cache operations in development
config.cache_store = :memory_store
config.view_component_preview_paths << "#{Rails.root}/test/components/previews"
```

## Cache Headers Reference

| Header | Purpose | Example |
|--------|---------|---------|
| Cache-Control | Controls caching behavior | `public, max-age=3600` |
| Expires | Absolute expiration time | `Wed, 26 Oct 2025 12:00:00 GMT` |
| ETag | Entity version for validation | `"abc123def456"` |
| Last-Modified | Last change timestamp | `Wed, 25 Oct 2025 10:30:00 GMT` |
| Vary | Cache key modifier | `Accept-Encoding, Accept-Language` |

## Implementation Checklist

- [ ] Add caching to high-frequency queries
- [ ] Implement cache invalidation in models
- [ ] Add Cache-Control headers to API endpoints
- [ ] Monitor cache hit rates
- [ ] Test cache invalidation
- [ ] Set up Redis in production (optional but recommended)
- [ ] Document cache keys
- [ ] Set up cache warming jobs
- [ ] Configure cache size limits
- [ ] Add cache metrics to monitoring

## Next Steps

1. **Phase 1:** Implement basic query caching in controllers
2. **Phase 2:** Add cache invalidation to models
3. **Phase 3:** Configure HTTP caching headers
4. **Phase 4:** Monitor and optimize TTLs
5. **Phase 5:** (Optional) Migrate to Redis for better performance

---

## Resources

- [Rails Caching Guide](https://guides.rubyonrails.org/caching_with_rails.html)
- [Redis Documentation](https://redis.io/documentation)
- [HTTP Caching Spec](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Cache Invalidation Patterns](https://martinfowler.com/bliki/TwoHardThings.html)
