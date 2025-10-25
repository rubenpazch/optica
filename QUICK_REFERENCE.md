# QUICK_REFERENCE.md - Caching Implementation Quick Start

## Files Created

1. **CACHING_STRATEGY.md** - Comprehensive caching strategy guide
2. **app/concerns/cacheable.rb** - Generic cacheable concern for models
3. **app/concerns/http_cacheable.rb** - HTTP caching headers helper
4. **lib/cache_manager.rb** - Centralized cache management utility
5. **config/initializers/cache_config.rb** - Cache configuration
6. **lib/tasks/cache.rake** - Cache management rake tasks
7. **app/models/concerns/patient_cacheable.rb** - Patient-specific caching
8. **app/models/concerns/user_cacheable.rb** - User-specific caching
9. **app/controllers/caching_helpers.rb** - Controller caching helpers
10. **test/cache_test_helpers.rb** - Testing utilities for cache

## Quick Integration Steps

### Step 1: Add to Models

```ruby
# app/models/patient.rb
class Patient < ApplicationRecord
  include PatientCacheable  # Add this line
  
  # ... rest of model
end

# app/models/user.rb
class User < ApplicationRecord
  include UserCacheable  # Add this line
  
  # ... rest of model
end
```

### Step 2: Use Cached Queries

```ruby
# Instead of:
@patients = Patient.all

# Use:
@patients = Patient.all_cached  # Cached for 15 minutes by default

# For searching:
@patients = Patient.search_cached(search_term)

# For specific record:
@patient = Patient.find_cached(id)
```

### Step 3: Add to Controllers

```ruby
# app/controllers/patients_controller.rb
class PatientsController < ApplicationController
  include CachingHelpers
  
  before_action :set_cache_headers, only: [:index, :show]
  before_action :disable_cache_on_write, only: [:create, :update, :destroy]
  
  def index
    @patients = Patient.all_cached
  end
  
  def show
    @patient = Patient.find_cached(params[:id])
  end
end
```

### Step 4: Cache Management

```bash
# Clear all caches
rails cache:clear

# Warm up caches
rails cache:warm

# View cache statistics
rails cache:stats

# Cleanup expired entries
rails cache:cleanup

# For Redis (if using)
rails cache:redis:connect
rails cache:redis:monitor
```

## Cache Durations Reference

```ruby
CacheManager::DURATIONS = {
  very_short:  5.minutes,    # Real-time data, search results
  short:       15.minutes,   # Patient lists, search results
  medium:      30.minutes,   # Individual records
  long:        1.hour,       # Reference data
  very_long:   1.day         # Master data, user lists
}
```

## Cache Keys Naming Convention

```
user/{id}                    # Individual user
users/all                    # All users
users/{role}                 # Users by role
users/email/{email}          # User by email

patient/{id}                 # Individual patient
patients/all                 # All patients
patients/active              # Active patients
patients/search/{hash}       # Search results
patients/city/{city}         # Patients by city

prescription/{id}            # Individual prescription
prescriptions/all            # All prescriptions

api/v1/{resource}/{action}   # API endpoints
```

## HTTP Cache Headers

```ruby
# Cache for 15 minutes
response.headers['Cache-Control'] = 'public, max-age=900'

# Don't cache
response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'

# Cache with etag
response.headers['ETag'] = "\"#{object.cache_key}\""

# Cache with last-modified
response.headers['Last-Modified'] = object.updated_at.httpdate
```

## Testing Caches

```ruby
# In your tests (test_helper.rb already includes this)
def test_patient_caching
  patient = Patient.create!(first_name: 'John', last_name: 'Doe', ...)
  
  # First call caches it
  patient1 = Patient.find_cached(patient.id)
  assert_cache_hit("patient/#{patient.id}")
  
  # Updating invalidates cache
  patient.update!(first_name: 'Jane')
  assert_cache_miss("patient/#{patient.id}")
end
```

## Performance Monitoring

```ruby
# In Rails console
CacheManager.stats
# => Displays cache hit/miss ratios

# Log cache operations
Rails.logger.info("Cache operation")

# Manual cache inspection
Rails.cache.exist?("patient/1")  # Check if key exists
Rails.cache.read("patient/1")    # Read value
Rails.cache.write("key", value, expires_in: 1.hour)  # Write value
Rails.cache.delete("patient/1")  # Delete single key
Rails.cache.delete_matched("patient/*")  # Delete pattern
```

## Common Cache Keys to Monitor

```ruby
# Patient operations
patient/*        # Any patient cache
patients/*       # Any patients collection cache

# User operations
user/*           # Any user cache
users/*          # Any users collection cache

# API operations
api/v1/*         # Any API cache
```

## Debugging Cache Issues

```ruby
# Check if cache is working
Rails.cache.is_a?(ActiveSupport::Cache::NullStore)  # => false if working

# Get current cache store
Rails.cache.class

# Check cache version
ENV['CACHE_VERSION']

# Development: enable cache debugging
config.cache_store = :memory_store
config.action_controller.perform_caching = true

# Clear everything
Rails.cache.clear
```

## Next Steps

1. **Identify Hot Spots:** Use rails logs to find slow queries
2. **Measure Baselines:** Record response times before caching
3. **Implement Gradually:** Start with high-traffic endpoints
4. **Monitor Results:** Compare performance before/after
5. **Adjust TTLs:** Fine-tune cache durations based on usage
6. **Deploy:** Test in staging first, then production
7. **Monitor:** Set up alerts for cache issues

## Environment Variables

```bash
# Set cache version (invalidates all caches on change)
export CACHE_VERSION=1

# Redis URL (if using redis-cache-store)
export REDIS_URL=redis://127.0.0.1:6379/1

# Cache namespace prefix
export CACHE_NAMESPACE=optica_cache
```

## Configuration Files to Update

1. **config/environments/production.rb** - Already configured with solid_cache_store
2. **config/environments/development.rb** - Set cache_store = :memory_store
3. **config/initializers/cache_config.rb** - Additional cache settings
4. **lib/tasks/cache.rake** - Cache management tasks

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cache not working | Check Rails.env, ensure cache_store is configured |
| Stale data appearing | Check TTLs, ensure invalidation is happening |
| Cache growing too large | Reduce TTLs, implement cleanup tasks |
| High memory usage | Use Redis instead of in-memory store |
| Cache invalidation not working | Check after_update/after_destroy hooks |

## Resources

- [Rails Guides - Caching](https://guides.rubyonrails.org/caching_with_rails.html)
- [solid_cache gem](https://github.com/rails/solid_cache)
- [redis-rails gem](https://github.com/redis-store/redis-rails)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

---

## Implementation Timeline

**Phase 1 (Week 1):** 
- [ ] Add concerns to models
- [ ] Test basic caching
- [ ] Monitor performance

**Phase 2 (Week 2):**
- [ ] Add to controllers
- [ ] Implement HTTP headers
- [ ] Update tests

**Phase 3 (Week 3):**
- [ ] Deploy to production
- [ ] Monitor cache hit rates
- [ ] Adjust TTLs based on data

**Phase 4 (Week 4+):**
- [ ] Consider Redis migration
- [ ] Implement cache warming
- [ ] Set up monitoring/alerts
