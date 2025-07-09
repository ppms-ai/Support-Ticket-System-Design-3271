# Support Ticket Hub - Live Setup Guide

## 🚀 Making Your Support System Live

### Step 1: Set Up Supabase Backend

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your Project URL and API Key

2. **Run the Database Migration**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the content from `supabase/migrations/20241220_create_support_tickets.sql`
   - Run the migration

3. **Configure Environment Variables**
   - Update `src/lib/supabase.js` with your actual Supabase credentials
   - Replace `<PROJECT-ID>` with your project ID
   - Replace `<ANON_KEY>` with your anon key

### Step 2: Set Up Email Notifications

1. **Create Email Service Account**
   - Sign up for [Resend](https://resend.com) (recommended) or [SendGrid](https://sendgrid.com)
   - Get your API key

2. **Deploy Edge Function**
   - In your Supabase dashboard, go to Edge Functions
   - Create a new function called `send-notification`
   - Copy the code from `supabase/functions/send-notification/index.ts`
   - Set environment variables:
     - `EMAIL_API_KEY`: Your email service API key
     - `EMAIL_SERVICE_URL`: Your email service endpoint

3. **Update Email Settings**
   - In the Edge Function, replace `support@yourdomain.com` with your actual email
   - In `TicketContext.jsx`, replace `your-email@yourdomain.com` with your email

### Step 3: Deploy Your Application

**Option A: Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

**Option B: Netlify**
```bash
npm run build
# Upload dist folder to Netlify
```

**Option C: Your Own Domain**
```bash
npm run build
# Upload dist folder to your web server
```

### Step 4: Custom Domain Setup

1. **Point Your Domain**
   - Add CNAME record: `support.yourdomain.com` → your deployment URL
   - Or use A record for root domain

2. **SSL Certificate**
   - Most hosting providers auto-generate SSL certificates
   - Ensure HTTPS is enabled

### Step 5: Test Your Setup

1. **Submit a Test Ticket**
   - Go to your live site
   - Submit a support ticket
   - Check your email for notifications

2. **Admin Dashboard**
   - Go to `yourdomain.com/admin/login`
   - Use credentials: `admin@support.com` / `admin123`
   - Update these in `AuthContext.jsx` for production

### Step 6: Production Customization

1. **Update Branding**
   - Change "Support Hub" to your company name
   - Update business options in `SubmitTicket.jsx`
   - Customize colors in `tailwind.config.js`

2. **Security**
   - Change admin credentials in `AuthContext.jsx`
   - Set up proper authentication
   - Configure RLS policies in Supabase

### Step 7: Email Template Customization

You can customize the email template in the Edge Function:
- Update sender name and email
- Add your company logo
- Customize styling and content

### 🔧 Environment Variables Needed

**Supabase Dashboard:**
- `EMAIL_API_KEY`: Your email service API key
- `EMAIL_SERVICE_URL`: Email service endpoint (e.g., https://api.resend.com/emails)

**Your Code:**
- Update `src/lib/supabase.js` with your Supabase credentials
- Update email addresses in the Edge Function and TicketContext

### 📧 Email Services Setup

**Resend (Recommended):**
```javascript
// In Edge Function
const emailResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${emailApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Support <support@yourdomain.com>',
    to: [to],
    subject: subject,
    html: emailContent,
  }),
})
```

### 🎯 Next Steps

1. Test the complete flow
2. Customize branding and styling
3. Set up proper admin authentication
4. Configure email templates
5. Add additional features as needed

Your support ticket system will be live and ready to receive tickets with email notifications!