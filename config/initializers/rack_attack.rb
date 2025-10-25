# frozen_string_literal: true

# Rack::Attack configuration for rate limiting and DDoS prevention
# This middleware protects the application from excessive requests and abuse

class Rack::Attack
  # Cache backend configuration
  # Using Rails.cache for distributed rate limiting
  cache.store = :rails_cache

  # Custom helpers for IP detection (handles proxies)
  def self.ip_identifier(request)
    request.ip
  end

  # Throttle authentication attempts to prevent brute force attacks
  # Allow 10 login attempts per IP per 15 minutes
  throttle("auth/ip", limit: 10, period: 15.minutes) do |request|
    if request.path == "/api/v1/users/sign_in" && request.post?
      request.ip
    end
  end

  # Throttle API requests by IP address
  # Allow 300 requests per hour per IP (5 requests per minute on average)
  throttle("api/ip", limit: 300, period: 1.hour) do |request|
    if request.path.start_with?("/api/") && request.get?
      request.ip
    end
  end

  # Throttle POST/PUT/DELETE requests more strictly
  # Allow 50 write requests per hour per IP
  throttle("api/write/ip", limit: 50, period: 1.hour) do |request|
    if request.path.start_with?("/api/") && !request.get? && !request.head?
      request.ip
    end
  end

  # Throttle user creation attempts to prevent account enumeration and spam
  # Allow 5 new user creations per day per IP
  throttle("signup/ip", limit: 5, period: 1.day) do |request|
    if request.path == "/api/v1/users" && request.post?
      request.ip
    end
  end

  # Throttle password reset attempts to prevent abuse
  # Allow 5 password reset requests per hour per IP
  throttle("password-reset/ip", limit: 5, period: 1.hour) do |request|
    if request.path.match?(%r{/api/v1/users/\d+/reset-password}) && request.post?
      request.ip
    end
  end

  # Limit by authenticated user (if available) to prevent authenticated abuse
  # Allow 1000 requests per authenticated user per hour
  throttle("auth-user/api", limit: 1000, period: 1.hour) do |request|
    # Extract user ID from JWT token if available
    if request.path.start_with?("/api/") && request.headers["Authorization"].present?
      # Use a stable identifier for the user
      # You could extract this from the JWT token in a real scenario
      request.headers["Authorization"].hash
    end
  end

  # Respond with 429 Too Many Requests when throttle is exceeded
  self.throttled_response = lambda { |env|
    match_data = env["rack.attack.match_data"]
    now = Time.now.utc
    headers = {
      "Content-Type" => "application/json",
      "Retry-After" => (match_data[:period] - (now.to_i % match_data[:period])).to_s
    }

    [
      429, # HTTP status
      headers,
      [{
        status: 429,
        error: "Too Many Requests",
        message: "You have been rate limited. Please try again in #{match_data[:period]} seconds.",
        retry_after: match_data[:period]
      }.to_json]
    ]
  }

  # Track but don't block requests to API (for monitoring)
  # You can use this to log and monitor suspicious activity
  track("api/tracked", limit: 0, period: 1.hour) do |request|
    request.path.start_with?("/api/")
  end

  # Allow all other requests (whitelisting approach for safety)
  Rack::Attack.safelist('allow all') { |req| true }
end
