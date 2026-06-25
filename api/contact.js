// api/contact.js — Vercel Serverless Function
// Receives form data and sends email via Resend (free tier: 3,000 emails/month)

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fname, lname, email, level, format, goals } = req.body;

  // Basic validation
  if (!fname || !lname || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  // Resend API call
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // IMPORTANT: 'from' must use a domain you've verified in Resend.
        // On the free plan you can use: onboarding@resend.dev  (Resend's shared domain)
        // OR set up your own domain in Resend dashboard and use e.g. noreply@yourdomain.com
        from: 'Iryna Kurekina Website <onboarding@resend.dev>',

        // Where the enquiry lands
        to: ['akurekin@gmail.com'],

        // Reply-to so you can reply directly to the student
        reply_to: email,

        subject: `New lesson enquiry from ${fname} ${lname}`,

        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; color: #1A1410;">
            <h2 style="color: #C0392B; border-bottom: 1px solid #eee; padding-bottom: 12px;">
              New Lesson Enquiry
            </h2>
            <table style="width:100%; border-collapse: collapse; font-size: 16px; line-height: 1.7;">
              <tr>
                <td style="padding: 8px 0; color: #6B6057; width: 140px;"><strong>Name</strong></td>
                <td style="padding: 8px 0;">${fname} ${lname}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B6057;"><strong>Email</strong></td>
                <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B6057;"><strong>Level</strong></td>
                <td style="padding: 8px 0;">${level || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B6057;"><strong>Format</strong></td>
                <td style="padding: 8px 0;">${format || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B6057; vertical-align: top;"><strong>Goals</strong></td>
                <td style="padding: 8px 0;">${goals || 'Not provided'}</td>
              </tr>
            </table>
            <p style="margin-top: 24px; font-size: 13px; color: #aaa;">
              Sent from irynaкurekina.com contact form
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend error:', errorData);
      return res.status(500).json({ error: 'Failed to send email. Please try again.' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
