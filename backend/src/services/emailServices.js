const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// Función flexible para recordatorios o envíos con PDF
const sendInvoiceEmail = async ({ to, subject, htmlContent, pdfBuffer, filename }) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.sender = { name: "Folio", email: "no-reply@tudominio.com" };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  // Si decides adjuntar el PDF opcionalmente
  if (pdfBuffer && filename) {
    sendSmtpEmail.attachment = [
      {
        content: pdfBuffer.toString('base64'),
        name: filename
      }
    ];
  }

  return await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = { sendInvoiceEmail };