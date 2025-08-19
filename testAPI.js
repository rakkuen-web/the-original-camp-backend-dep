require('dotenv').config();
const mongoose = require('mongoose');

async function testAPI() {
  try {
    console.log('🌐 Testing API Endpoints\n');

    // Test availability check API
    console.log('📡 TEST: Availability Check API');
    const availabilityResponse = await fetch('http://localhost:3000/api/room-inventory/check-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkIn: '2024-12-28',
        checkOut: '2024-12-30',
        guests: 2,
        roomType: 'deluxe'
      })
    });
    
    if (availabilityResponse.ok) {
      const availabilityData = await availabilityResponse.json();
      console.log('✅ Availability API Response:', availabilityData);
    } else {
      console.log('❌ Availability API failed:', availabilityResponse.status);
    }

    // Test reservation creation with availability check
    console.log('\n🏨 TEST: Create Reservation via API');
    const reservationResponse = await fetch('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName: 'API Test User',
        guestEmail: 'apitest@test.com',
        guestPhone: '+1234567890',
        checkIn: '2024-12-28T15:00:00.000Z',
        checkOut: '2024-12-30T11:00:00.000Z',
        guests: 2,
        tentType: 'deluxe',
        specialRequests: 'API test reservation',
        paymentStatus: 'paid'
      })
    });
    
    if (reservationResponse.ok) {
      const reservationData = await reservationResponse.json();
      console.log('✅ Reservation API Response:', {
        bookingRef: reservationData.bookingRef,
        status: reservationData.status,
        paymentStatus: reservationData.paymentStatus,
        totalPrice: reservationData.totalPrice
      });
    } else {
      const errorData = await reservationResponse.json();
      console.log('❌ Reservation API failed:', errorData.message);
    }

    // Test overbooking prevention
    console.log('\n🚫 TEST: Overbooking Prevention');
    for (let i = 1; i <= 4; i++) {
      const overbookResponse = await fetch('http://localhost:3000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: `Overbook Test ${i}`,
          guestEmail: `overbook${i}@test.com`,
          guestPhone: `+123456789${i}`,
          checkIn: '2024-12-28T15:00:00.000Z',
          checkOut: '2024-12-30T11:00:00.000Z',
          guests: 3,
          tentType: 'deluxe',
          paymentStatus: 'paid'
        })
      });
      
      if (overbookResponse.ok) {
        const data = await overbookResponse.json();
        console.log(`✅ Reservation ${i}: Created ${data.bookingRef}`);
      } else {
        const errorData = await overbookResponse.json();
        console.log(`❌ Reservation ${i}: BLOCKED - ${errorData.message}`);
      }
    }

    console.log('\n🎉 API TESTS COMPLETED!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testAPI();