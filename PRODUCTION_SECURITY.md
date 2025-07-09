# 🔒 Production Security Checklist

## ⚠️ CRITICAL: Before Going Live

### 1. Change Admin Credentials
The default admin credentials are:
- Email: `admin@support.com`
- Password: `admin123`

**YOU MUST CHANGE THESE** in `src/context/AuthContext.jsx`:

```javascript
// CHANGE THESE BEFORE DEPLOYMENT!
if (credentials.email === 'your-admin@yourdomain.com' && 
    credentials.password === 'your-very-secure-password') {
```

### 2. Use Environment Variables (Recommended)
Create a `.env` file for sensitive data:
```bash
# .env (DO NOT commit to git)
VITE_ADMIN_EMAIL=admin@yourdomain.com
VITE_ADMIN_PASSWORD=your-secure-password
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then update your code:
```javascript
// In src/context/AuthContext.jsx
const login = (credentials) => {
  if (credentials.email === import.meta.env.VITE_ADMIN_EMAIL && 
      credentials.password === import.meta.env.VITE_ADMIN_PASSWORD) {
    // ... rest of function
  }
}
```

### 3. Supabase Security
- Enable Row Level Security (RLS) on all tables
- Review and test all database policies
- Limit API key permissions
- Enable database backups

### 4. HTTPS and Domain Security
- Ensure SSL certificate is active
- Force HTTPS redirects
- Use secure headers
- Implement Content Security Policy (CSP)

### 5. Email Security
- Use authenticated domains for email sending
- Set up SPF, DKIM, and DMARC records
- Monitor email delivery rates
- Implement rate limiting

## 🛡️ Additional Security Measures

### Rate Limiting
Consider implementing rate limiting for:
- Ticket submissions
- Admin login attempts
- Email sending

### Input Validation
- Sanitize all user inputs
- Validate email formats
- Limit file upload sizes
- Check for malicious content

### Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor unusual activity
- Set up alerts for failed logins
- Track email delivery failures

### Backup Strategy
- Regular database backups
- Export tickets periodically
- Keep email templates backed up
- Document recovery procedures

## 🚨 Emergency Procedures

### If Compromised
1. Change all passwords immediately
2. Revoke and regenerate API keys
3. Check database for unauthorized changes
4. Review access logs
5. Update security measures

### Password Recovery
Since this is a simple demo system, implement a proper password recovery mechanism for production use.

## 📋 Security Audit Checklist

- [ ] Admin credentials changed from defaults
- [ ] Environment variables configured
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Supabase RLS policies reviewed and tested
- [ ] Email domain authentication configured
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] Monitoring and alerting set up
- [ ] Backup procedures tested
- [ ] Security headers configured
- [ ] Dependencies updated to latest versions
- [ ] Error messages don't expose sensitive information
- [ ] Admin routes protected from unauthorized access
- [ ] Database connection secured
- [ ] API keys have minimal required permissions

Remember: Security is an ongoing process, not a one-time setup!