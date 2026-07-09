const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY
});

async function sendEmail({ to, subject, html }) {
  const recipients = Array.isArray(to)
    ? to.map((email) => ({ email }))
    : [{ email: to }];

  const sendSmtpEmail = {
    sender: {
      name: 'college-cart',
      email: process.env.EMAIL || 'no-reply@college-cart.com'
    },
    to: recipients,
    subject,
    htmlContent: html
  };

  try {
    await brevo.transactionalEmails.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error) {
    console.error('Brevo email send failed:', error?.response?.body || error?.message || error);
    throw error;
  }
}

module.exports = {
  sendEmail
};
