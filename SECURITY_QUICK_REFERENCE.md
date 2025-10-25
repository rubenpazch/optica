# Security Best Practices Quick Reference

## For Developers Working on This Rails API

### 1. Input Validation Checklist

When creating new endpoints:

```ruby
# ✅ DO THIS:
def create
  # Validate input format
  unless validate_email_format(params[:email])
    return render json: { error: "Invalid email" }, status: :bad_request
  end

  # Validate password strength
  unless validate_password_strength(params[:password])
    return render json: { error: "Weak password" }, status: :bad_request
  end

  # Log security events
  log_security_event("resource_created", { resource: "item", details: {} })
end

# ❌ DON'T DO THIS:
def create
  # Never skip validation
  @item = Item.create(params[:item])
  # Never accept unvalidated input
end
```

### 2. Parameter Sanitization

```ruby
# Use strong_parameters - already configured
def create
  @user = User.new(user_params)
end

private

# Whitelist allowed parameters only
def user_params
  params.require(:user).permit(:email, :password, :password_confirmation, :role)
end
```

### 3. Authorization Checks

```ruby
# ✅ DO THIS:
before_action :authenticate_user!
before_action :authorize_admin!, only: [:admin_actions]

# ❌ DON'T DO THIS:
# Never skip authentication on sensitive endpoints
def admin_only_action
  # Don't make assumptions about user permissions
end
```

### 4. Error Handling

```ruby
# ✅ Log suspicious activities
def invalid_action
  log_security_event("suspicious_activity", { reason: "explanation" })
  render json: { error: "Access denied" }, status: :forbidden
end

# ❌ Don't expose internal error details
def bad_error_handling
  render json: @user.errors  # Exposes database structure!
end
```

### 5. Password Management

```ruby
# ✅ DO THIS - Validate password strength before saving
def reset_password
  unless validate_password_strength(new_password)
    return render json: { error: "Weak password" }, status: :bad_request
  end

  @user.password = new_password
  @user.save
end

# ❌ DON'T DO THIS
def bad_password_reset
  @user.password = params[:password]  # No validation!
  @user.save
end
```

### 6. API Rate Limits (handled by Rack-Attack)

Current limits per IP:
- **Login:** 10 attempts / 15 minutes
- **API GET:** 300 requests / hour
- **API Write (POST/PUT/DELETE):** 50 requests / hour
- **User Creation:** 5 / day
- **Password Reset:** 5 / hour

If legitimate use hits limits, contact admin to whitelist IP.

### 7. JWT Token Expiration

Tokens expire after **8 hours**.

**Handling expired tokens on frontend:**

```javascript
// When you get 401 Unauthorized
if (error.response.status === 401) {
  // Token expired
  localStorage.removeItem('auth_token');
  // Redirect to login
  window.location.href = '/login';
}
```

### 8. Security Headers Compliance

Headers automatically added to all responses:
- ✅ Content-Security-Policy
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Referrer-Policy
- ✅ Strict-Transport-Security (production only)

**Don't override these unless absolutely necessary.**

### 9. CORS Configuration

Only these origins are allowed:
- **Development:** `localhost:3000`, `localhost:5173`, `127.0.0.1`
- **Production:** HTTPS URLs from approved domains

**Don't set `Access-Control-Allow-Origin: *` - security risk!**

### 10. Common Security Mistakes to Avoid

| ❌ Don't | ✅ Do |
|---------|------|
| Log passwords | Log only action & timestamp |
| Expose user IDs in errors | Return generic error messages |
| Accept all input | Validate & sanitize input |
| Skip authentication | Always authenticate |
| Hardcode secrets | Use credentials.yml.enc |
| Trust user input | Always validate |
| Return stack traces | Log internally, show generic error |
| Disable SSL | Always use HTTPS |

---

## Deployment Checklist

Before deploying to production:

- [ ] Verify `config.force_ssl = true` in `config/environments/production.rb`
- [ ] Ensure JWT secret is set in credentials
- [ ] Check rate limiting thresholds are appropriate
- [ ] Review security event logging
- [ ] Test all authentication flows
- [ ] Verify CORS origins are set correctly
- [ ] Enable HSTS in production
- [ ] Monitor failed login attempts
- [ ] Set up log aggregation
- [ ] Configure alerts for suspicious activity

---

## Useful Commands

### View Security Logs

```bash
# Monitor security events in real-time
tail -f log/production.log | grep -E "security|authentication|error"

# Find failed login attempts
grep "invalid_user_creation_attempt" log/production.log

# Count 429 rate limit responses
grep "429" log/production.log | wc -l
```

### Test Rate Limiting

```bash
# Quick rate limit test
ruby -e '10.times { puts `curl -s http://localhost:3000/api/v1/users -H "Authorization: Bearer TOKEN"` }'
```

### Update Rate Limits

Edit `config/initializers/rack_attack.rb` and restart Rails:

```bash
# In production, use a zero-downtime restart
rails restart
```

---

## Emergency Procedures

### If experiencing DDoS attack:

1. Check `config/initializers/rack_attack.rb`
2. Lower rate limits temporarily
3. Enable IP blocking for suspicious sources
4. Contact hosting provider if attack continues

### If credentials compromised:

1. Rotate JWT secrets immediately
2. Force all users to re-authenticate
3. Regenerate API keys
4. Review security logs for unauthorized access

### If database compromised:

1. Verify no passwords leaked (bcrypt makes this unlikely)
2. Reset passwords for all users
3. Rotate API credentials
4. Enable 2FA for admin accounts

---

## Resources

- Security Improvements Details: `SECURITY_IMPROVEMENTS.md`
- Rails Security Guide: https://guides.rubyonrails.org/security.html
- OWASP Top 10: https://owasp.org/Top10/
- Devise Documentation: https://github.com/heartcombo/devise
- Rack-Attack Documentation: https://github.com/rack/rack-attack
