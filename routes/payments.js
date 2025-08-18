const express = require('express');
const router = express.Router();
const paypal = require('paypal-rest-sdk');

// Configure PayPal
paypal.configure({
  'mode': process.env.PAYPAL_MODE || 'sandbox',
  'client_id': process.env.PAYPAL_CLIENT_ID || 'your-paypal-client-id',
  'client_secret': process.env.PAYPAL_CLIENT_SECRET || 'your-paypal-client-secret'
});

// Create PayPal payment
router.post('/paypal/create', async (req, res) => {
  try {
    const { amount, currency = 'USD', description, bookingData } = req.body;

    console.log('Creating PayPal payment:', { amount, currency, description });

    const create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": `${process.env.FRONTEND_URL}/booking-confirmation?success=true`,
        "cancel_url": `${process.env.FRONTEND_URL}/booking?cancelled=true`
      },
      "transactions": [{
        "item_list": {
          "items": [{
            "name": description || 'Desert Camp Booking',
            "sku": "booking",
            "price": amount.toFixed(2),
            "currency": currency,
            "quantity": 1
          }]
        },
        "amount": {
          "currency": currency,
          "total": amount.toFixed(2)
        },
        "description": description || 'Desert Camp Booking'
      }]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) {
        console.error('PayPal Error:', error.response || error);
        res.status(500).json({ error: 'Payment creation failed', details: error.message });
      } else {
        console.log('PayPal payment created:', payment.id);
        const approval_url = payment.links.find(link => link.rel === 'approval_url');
        res.json({
          id: payment.id,
          status: payment.state,
          approval_url: approval_url ? approval_url.href : null
        });
      }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Payment creation failed', details: error.message });
  }
});

// Execute PayPal payment
router.post('/paypal/execute', async (req, res) => {
  try {
    const { paymentId, payerId } = req.body;

    const execute_payment_json = {
      "payer_id": payerId
    };

    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
      if (error) {
        console.error('PayPal Execute Error:', error);
        res.status(500).json({ error: 'Payment execution failed' });
      } else {
        res.json({
          id: payment.id,
          status: payment.state,
          payer: payment.payer
        });
      }
    });
  } catch (error) {
    console.error('Payment execution error:', error);
    res.status(500).json({ error: 'Payment execution failed' });
  }
});

module.exports = router;