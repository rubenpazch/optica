# lib/middleware/security_headers_middleware.rb

class SecurityHeadersMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, body = @app.call(env)

    # Content Security Policy - strict default, allows refinement per page
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net", # Rails needs unsafe-inline for dynamic JS
      "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com", # Inline styles for CSS-in-JS
      "img-src 'self' data: https:",
      "font-src 'self' fonts.gstatic.com cdn.jsdelivr.net",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ")

    # Prevent MIME type sniffing
    headers['X-Content-Type-Options'] = 'nosniff'

    # Enable XSS protection in older browsers
    headers['X-XSS-Protection'] = '1; mode=block'

    # Prevent clickjacking
    headers['X-Frame-Options'] = 'DENY'

    # Strict Transport Security - HTTPS only (1 year)
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload' if Rails.env.production?

    # Referrer Policy - security focused
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    # Feature/Permissions Policy - disable dangerous features
    headers['Permissions-Policy'] = [
      'accelerometer=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()'
    ].join(', ')

    # Remove server header to avoid version disclosure
    headers.delete('Server')
    headers.delete('X-Powered-By')

    [status, headers, body]
  end
end
