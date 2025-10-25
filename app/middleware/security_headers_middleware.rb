# frozen_string_literal: true

# Security headers middleware for additional protection against common attacks
# This middleware adds HTTP security headers to all responses

class SecurityHeadersMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, body = @app.call(env)

    # Prevent clickjacking attacks
    # DENY - disallows framing completely (recommended for APIs)
    headers["X-Frame-Options"] = "DENY"

    # Prevent MIME-type sniffing
    # Tells browsers not to guess the MIME type and use the Content-Type header
    headers["X-Content-Type-Options"] = "nosniff"

    # Enable Cross-Site Scripting (XSS) protection in older browsers
    headers["X-XSS-Protection"] = "1; mode=block"

    # Content Security Policy - restrict resource loading
    # This helps prevent XSS, clickjacking, and injection attacks
    headers["Content-Security-Policy"] = [
      "default-src 'self'",           # Only allow resources from same origin
      "script-src 'self' 'unsafe-inline'",  # Allow scripts from same origin (needed for Rails)
      "style-src 'self' 'unsafe-inline'",   # Allow styles from same origin
      "img-src 'self' data: https:",        # Allow images from same origin, data URIs, and HTTPS
      "font-src 'self' data:",              # Allow fonts from same origin and data URIs
      "connect-src 'self'",                 # Only allow API connections to same origin
      "frame-ancestors 'none'",             # Don't allow framing
      "base-uri 'self'",                    # Restrict base tag to same origin
      "form-action 'self'"                  # Restrict form submissions to same origin
    ].join("; ")

    # Referrer Policy - control what referrer information is shared
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # Feature Policy / Permissions Policy - disable unnecessary browser features
    headers["Permissions-Policy"] = [
      "geolocation=()",
      "microphone=()",
      "camera=()",
      "payment=()"
    ].join(", ")

    # HTTP Strict Transport Security (HSTS)
    # Only set in production to enforce HTTPS
    if Rails.env.production?
      # max-age is 1 year in seconds; includeSubDomains ensures all subdomains also use HTTPS
      headers["Strict-Transport-Security"] = "max-age=#{1.year.to_i}; includeSubDomains; preload"
    end

    [status, headers, body]
  end
end
