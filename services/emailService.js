const nodemailer = require('nodemailer');



// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hdanine43@gmail.com',
    pass: 'rpjeegfgfvzbapgh'
  }
});

const sendBookingConfirmation = async (bookingData) => {
  const { bookingRef, guestName, guestEmail, checkIn, checkOut, guests, tentType, totalPrice, selectedActivities } = bookingData;
  
  const activitiesList = selectedActivities && selectedActivities.length > 0 
    ? selectedActivities.map(activity => `- ${activity.name} ($${activity.price}/person)`).join('\n')
    : 'No activities selected';

  const emailContent = `
    <h2>🏜️ Booking Confirmation - The Original Camp</h2>
    
    <p>Dear ${guestName},</p>
    
    <p>Thank you for your booking! We're excited to welcome you to our desert camp.</p>
    
    <h3>📋 Booking Details:</h3>
    <ul>
      <li><strong>Booking Reference:</strong> ${bookingRef}</li>
      <li><strong>Guest Name:</strong> ${guestName}</li>
      <li><strong>Check-in:</strong> ${new Date(checkIn).toDateString()}</li>
      <li><strong>Check-out:</strong> ${new Date(checkOut).toDateString()}</li>
      <li><strong>Guests:</strong> ${guests}</li>
      <li><strong>Room Type:</strong> ${tentType}</li>
      <li><strong>Total Price:</strong> $${totalPrice}</li>
    </ul>
    
    <h3>🎯 Activities:</h3>
    <p>${activitiesList}</p>
    
    <h3>📍 Location:</h3>
    <p>Agafay desert Marrakech - Morocco</p>
    
    <p>We look forward to providing you with an unforgettable desert experience!</p>
    
    <p>Best regards,<br>
    The Original Camp Team<br>
    📞 +212 666 78 33 62<br>
    📞 +212 661 31 32 15<br>
    📧 contact@theoriginalcamp.com</p>
  `;

  const mailOptions = {
    from: 'AHSANE VOYAGE <hdanine43@gmail.com>',
    to: guestEmail,
    subject: '🏜️ Booking Confirmation - The Original Camp',
    html: emailContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', guestEmail);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

const sendReviewRequest = async (reviewData) => {
  const { guestName, guestEmail, bookingRef, reviewLink } = reviewData;
  
  const emailContent = `
    <h2>🌟 Share Your Experience - The Original Camp</h2>
    
    <p>Dear ${guestName},</p>
    
    <p>Thank you for staying with us! We hope you had an amazing desert experience.</p>
    
    <p>We would love to hear about your stay. Your feedback helps us improve and helps other travelers discover our camp.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${reviewLink}" style="background: #DAA520; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Leave a Review</a>
    </div>
    
    <p><strong>Booking Reference:</strong> ${bookingRef}</p>
    
    <p>Thank you for choosing The Original Camp!</p>
    
    <p>Best regards,<br>
    The Original Camp Team<br>
    📞 +212 666 78 33 62<br>
    📞 +212 661 31 32 15<br>
    📧 contact@theoriginalcamp.com</p>
  `;

  const mailOptions = {
    from: 'The Original Camp <hdanine43@gmail.com>',
    to: guestEmail,
    subject: '🌟 Share Your Desert Experience - Review Request',
    html: emailContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Review request email sent to:', guestEmail);
    return { success: true };
  } catch (error) {
    console.error('Review email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendBookingConfirmation, sendReviewRequest };