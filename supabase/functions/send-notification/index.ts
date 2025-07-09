import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, ticket, emailConfig, recipient, oldStatus, updateMessage } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get email configuration from request or database
    let config = emailConfig
    if (!config) {
      const { data: configData } = await supabase
        .from('email_config_hub2024')
        .select('config')
        .eq('id', 'default')
        .single()
      
      config = configData?.config || {
        notificationEmails: ['support@yourdomain.com'],
        fromEmail: 'support@yourdomain.com',
        fromName: 'Support Team',
        emailService: 'resend',
        apiKey: Deno.env.get('EMAIL_API_KEY') || '',
      }
    }

    // Get branding configuration
    const { data: brandingData } = await supabase
      .from('email_config_hub2024')
      .select('config')
      .eq('id', 'branding')
      .single()
    
    const branding = brandingData?.config || {
      company_name: 'Your Company Name',
      company_address: '123 Main Street, City, State 12345',
      dashboard_url: window.location.origin + '/#/admin/dashboard',
      primary_color: '#0ea5e9',
      secondary_color: '#3b82f6'
    }

    // Get email template
    const { data: templateData } = await supabase
      .from('email_templates_hub2024')
      .select('*')
      .eq('id', type)
      .single()

    if (!templateData) {
      throw new Error(`Email template '${type}' not found`)
    }

    if (!config.apiKey) {
      throw new Error('EMAIL_API_KEY not configured')
    }

    // Prepare template variables
    let templateVariables = { ...branding }
    
    // Add status check URL
    const statusCheckUrl = `${window.location.origin}/#/status`
    templateVariables.status_check_url = statusCheckUrl
    templateVariables.from_email = config.fromEmail
    templateVariables.from_name = config.fromName
    
    if (type === 'new_ticket') {
      templateVariables = {
        ...templateVariables,
        ticket_number: ticket.ticket_number,
        customer_name: ticket.name,
        customer_email: ticket.email,
        business: ticket.business,
        priority: ticket.priority,
        priority_color: getPriorityColor(ticket.priority),
        status: ticket.status,
        subject: ticket.subject,
        description: ticket.description.replace(/\n/g, '<br>'),
      }
    } else if (type === 'ticket_confirmation') {
      templateVariables = {
        ...templateVariables,
        ticket_number: ticket.ticket_number,
        customer_name: ticket.name,
        customer_email: ticket.email,
        business: ticket.business,
        priority: ticket.priority,
        priority_color: getPriorityColor(ticket.priority),
        status: ticket.status,
        subject: ticket.subject,
        description: ticket.description.replace(/\n/g, '<br>'),
      }
    } else if (type === 'ticket_update') {
      templateVariables = {
        ...templateVariables,
        ticket_number: ticket.ticket_number,
        customer_name: ticket.name,
        customer_email: ticket.email,
        business: ticket.business,
        priority: ticket.priority,
        priority_color: getPriorityColor(ticket.priority),
        status: ticket.status,
        status_color: getStatusColor(ticket.status),
        subject: ticket.subject,
        assignee: ticket.assignee || 'Support Team',
        update_time: new Date().toLocaleString(),
        update_message: updateMessage || `Your ticket status has been updated to: ${ticket.status}`,
      }
    } else if (type === 'ticket_resolved') {
      templateVariables = {
        ...templateVariables,
        ticket_number: ticket.ticket_number,
        customer_name: ticket.name,
        customer_email: ticket.email,
        business: ticket.business,
        subject: ticket.subject,
        assignee: ticket.assignee || 'Support Team',
        resolution_time: new Date().toLocaleString(),
        resolution_message: ticket.resolution_message || 'Your issue has been successfully resolved. If you continue to experience problems, please don\'t hesitate to contact us.',
        feedback_url: `${statusCheckUrl}?feedback=${ticket.ticket_number}`,
      }
    } else if (type === 'test_email') {
      templateVariables = {
        ...templateVariables,
        email_service: config.emailService,
        recipients: config.notificationEmails.join(', '),
        test_time: new Date().toLocaleString(),
      }
    }

    // Render template
    let emailContent = templateData.html_content
    let subject = templateData.subject

    Object.keys(templateVariables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      emailContent = emailContent.replace(regex, templateVariables[key] || '')
      subject = subject.replace(regex, templateVariables[key] || '')
    })

    // Determine recipients
    let recipients = []
    if (recipient) {
      // Single recipient (customer emails)
      recipients = [recipient]
    } else {
      // Multiple recipients (admin notifications)
      recipients = config.notificationEmails || []
    }

    // Send emails
    const emailPromises = recipients.map(async (email) => {
      const emailBody = getEmailBody(config.emailService, {
        from: `${config.fromName} <${config.fromEmail}>`,
        to: email,
        subject: subject,
        html: emailContent,
      })

      const emailResponse = await fetch(getEmailServiceUrl(config.emailService), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailBody),
      })

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text()
        throw new Error(`Email service error for ${email}: ${errorText}`)
      }

      return await emailResponse.json()
    })

    const results = await Promise.allSettled(emailPromises)
    const failures = results.filter(r => r.status === 'rejected')
    
    if (failures.length > 0) {
      console.error('Some emails failed:', failures)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: results.length - failures.length,
        failed: failures.length,
        results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function getEmailServiceUrl(service) {
  switch (service) {
    case 'resend':
      return 'https://api.resend.com/emails'
    case 'sendgrid':
      return 'https://api.sendgrid.com/v3/mail/send'
    default:
      return 'https://api.resend.com/emails'
  }
}

function getEmailBody(service, emailData) {
  switch (service) {
    case 'sendgrid':
      return {
        personalizations: [{
          to: [{ email: emailData.to }],
          subject: emailData.subject
        }],
        from: { email: emailData.from },
        content: [{
          type: 'text/html',
          value: emailData.html
        }]
      }
    case 'resend':
    default:
      return {
        from: emailData.from,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html
      }
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'High':
      return '#dc2626'
    case 'Medium':
      return '#d97706'
    case 'Low':
      return '#16a34a'
    default:
      return '#6b7280'
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'Open':
      return '#3b82f6'
    case 'In Progress':
      return '#f59e0b'
    case 'Resolved':
      return '#10b981'
    case 'Closed':
      return '#6b7280'
    default:
      return '#6b7280'
  }
}