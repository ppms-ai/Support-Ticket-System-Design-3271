# 🚀 Support Ticket Hub - Live Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Create Supabase project
- [ ] Run all database migrations
- [ ] Set up email service API keys
- [ ] Deploy Edge Functions
- [ ] Configure Row Level Security (RLS)

### 2. Environment Variables
- [ ] Update Supabase credentials
- [ ] Set up email service keys
- [ ] Configure custom domain URLs
- [ ] Update admin credentials

### 3. Security Configuration
- [ ] Change default admin password
- [ ] Configure proper RLS policies
- [ ] Set up CORS for your domain
- [ ] Enable SSL/HTTPS

---

## 🔧 Step 1: Supabase Backend Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and name your project
4. Wait for project to be ready
5. Note your **Project URL** and **API Key**

### Run Database Migrations
In your Supabase dashboard, go to **SQL Editor** and run each migration file:

```sql
-- 1. Run: supabase/migrations/20241220_create_support_tickets.sql
-- 2. Run: supabase/migrations/20241220_create_email_config.sql
-- 3. Run: supabase/migrations/20241220_create_email_templates.sql
```

### Deploy Edge Function
1. In Supabase dashboard, go to **Edge Functions**
2. Create new function named `send-notification`
3. Copy code from `supabase/functions/send-notification/index.ts`
4. Set environment variables:
   - `EMAIL_API_KEY`: Your email service API key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

---

## 🌐 Step 2: Email Service Setup

### Option A: Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add your domain for sending emails
4. Verify domain ownership

### Option B: SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key with Mail Send permissions
3. Set up sender authentication

---

## 📝 Step 3: Update Codebase

### Update Supabase Credentials
In `src/lib/supabase.js`:
```javascript
const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY'
```

### Update Admin Credentials (IMPORTANT!)
In `src/context/AuthContext.jsx`, change the login function:
```javascript
const login = (credentials) => {
  // Change these credentials before going live!
  if (credentials.email === 'your-admin@yourdomain.com' && 
      credentials.password === 'your-secure-password') {
    // ... rest of function
  }
}
```

### Update Business Options
In `src/pages/SubmitTicket.jsx`, customize the business options:
```javascript
const BUSINESS_OPTIONS = [
  'Your Business 1',
  'Your Business 2',
  'Your Business 3',
  // ... your actual businesses
];
```

### Update Branding
1. Change "Support Hub" to your company name in `src/components/Layout.jsx`
2. Update colors in `tailwind.config.js`
3. Replace logo/icon if needed

---

## 🚀 Step 4: Deploy Your Application

### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod

# Follow prompts to:
# - Connect to Git repository
# - Set up custom domain
# - Configure environment variables
```

### Option B: Netlify
```bash
# Build the app
npm run build

# Manual deployment:
# 1. Go to netlify.com
# 2. Drag and drop the 'dist' folder
# 3. Set up custom domain in site settings
```

### Option C: Your Own Server
```bash
# Build the app
npm run build

# Upload 'dist' folder to your web server
# Configure nginx/apache to serve the files
# Set up SSL certificate
```

---

## 🌍 Step 5: Custom Domain Setup

### DNS Configuration
Add these DNS records:
```
Type: CNAME
Name: support (or www)
Value: your-deployment-url.vercel.app
```

### SSL Certificate
- Most hosting providers auto-generate SSL certificates
- Ensure HTTPS is enabled and HTTP redirects to HTTPS

### Update URLs in Code
Update any hardcoded URLs to use your custom domain:
```javascript
// In email templates and configurations
const DASHBOARD_URL = 'https://support.yourdomain.com/#/admin/dashboard'
const STATUS_CHECK_URL = 'https://support.yourdomain.com/#/status'
```

---

## 📧 Step 6: Configure Email Notifications

### Set Email Service in Supabase
1. Go to your deployed app: `https://support.yourdomain.com/#/admin/login`
2. Login with admin credentials
3. Go to **Email Settings**
4. Configure:
   - **Email Service**: Resend or SendGrid
   - **API Key**: Your email service API key
   - **From Email**: `support@yourdomain.com`
   - **From Name**: Your Company Support
   - **Notification Emails**: Add admin email addresses

### Test Email Configuration
1. In Email Settings, click **Send Test Email**
2. Check your inbox for the test email
3. If successful, submit a test ticket to verify notifications

---

## 🔒 Step 7: Security Hardening

### Change Admin Credentials
```javascript
// In src/context/AuthContext.jsx
const login = (credentials) => {
  if (credentials.email === 'admin@yourdomain.com' && 
      credentials.password === 'very-secure-password-here') {
    // ... rest of function
  }
}
```

### Configure Supabase RLS
Ensure these policies are active in Supabase:
```sql
-- Allow public ticket submission
CREATE POLICY "Allow public insert" ON support_tickets_hub2024 
FOR INSERT TO public WITH CHECK (true);

-- Allow public status checking
CREATE POLICY "Allow public read" ON support_tickets_hub2024 
FOR SELECT TO public USING (true);
```

### Environment Variables (Production)
For production, consider using environment variables:
```javascript
// Create .env file (not committed to git)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAIL=admin@yourdomain.com
VITE_ADMIN_PASSWORD=your-secure-password
```

---

## ✅ Step 8: Final Testing

### Complete Flow Test
1. **Submit a ticket** from the public form
2. **Check email notifications** are received
3. **Login to admin dashboard**
4. **Update ticket status** and add notes
5. **Verify customer email updates** are sent
6. **Test status checking** from public form

### Performance Check
- Test page load speeds
- Verify mobile responsiveness
- Check email deliverability
- Test with multiple browsers

---

## 🎯 Step 9: Go Live Checklist

- [ ] Custom domain is working with SSL
- [ ] Admin credentials are changed from defaults
- [ ] Email notifications are working
- [ ] Database backups are enabled in Supabase
- [ ] All test tickets are cleaned up
- [ ] Business options are customized
- [ ] Branding is updated
- [ ] Terms of service/privacy policy links added (if needed)

---

## 📞 Step 10: Customer Communication

### Update Your Website
Add links to your new support system:
```html
<!-- Add to your main website -->
<a href="https://support.yourdomain.com">Submit Support Ticket</a>
<a href="https://support.yourdomain.com/#/status">Check Ticket Status</a>
```

### Email Signature
Update team email signatures:
```
Need help? Submit a ticket: https://support.yourdomain.com
Check ticket status: https://support.yourdomain.com/#/status
```

---

## 🛠️ Maintenance

### Regular Tasks
- Monitor email delivery rates
- Check Supabase usage limits
- Review and respond to tickets promptly
- Update email templates as needed
- Monitor system performance

### Backup Strategy
- Supabase automatically backs up your database
- Consider exporting tickets periodically
- Keep email templates backed up

---

## 🆘 Troubleshooting

### Common Issues
1. **Emails not sending**: Check API keys and domain verification
2. **Admin login not working**: Verify credentials in AuthContext
3. **Tickets not saving**: Check Supabase connection and RLS policies
4. **Domain not working**: Verify DNS settings and SSL certificate

### Support Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**🎉 Congratulations! Your support ticket system is now live and ready to help your customers!**