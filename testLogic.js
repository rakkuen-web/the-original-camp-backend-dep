require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Reservation = require('./models/Reservation');

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB\n');

    // Test 1: Check room inventory
    console.log('📋 TEST 1: Room Inventory Check');
    const rooms = await Room.find().sort({ roomNumber: 1 });
    console.log(`✅ Found ${rooms.length} rooms in inventory`);
    rooms.forEach(room => {
      console.log(`   ${room.roomNumber} (${room.roomType}) - ${room.maxGuests} guests, $${room.pricePerNight}/night`);
    });

    // Test 2: Availability check for valid dates
    console.log('\n📅 TEST 2: Availability Check (Valid Request)');
    const checkIn = new Date('2024-12-25');
    const checkOut = new Date('2024-12-27');
    
    const standardRooms = await Room.find({ roomType: 'standard', maxGuests: { $gte: 2 } });
    const conflictingReservations = await Reservation.find({
      tentType: 'standard',
      status: { $in: ['confirmed', 'pending'] },
      $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }]
    });
    
    const available = standardRooms.length - conflictingReservations.length;
    console.log(`✅ Standard rooms: ${standardRooms.length} total, ${conflictingReservations.length} occupied, ${available} available`);

    // Test 3: Create first reservation
    console.log('\n🏨 TEST 3: Create First Reservation');
    const reservation1 = new Reservation({
      bookingRef: 'TEST001',
      guestName: 'John Doe',
      guestEmail: 'john@test.com',
      guestPhone: '+1234567890',
      checkIn: checkIn,
      checkOut: checkOut,
      guests: 2,
      tentType: 'standard',
      totalPrice: 240,
      status: 'confirmed',
      paymentStatus: 'paid'
    });
    
    await reservation1.save();
    console.log(`✅ Created reservation ${reservation1.bookingRef} for ${reservation1.guestName}`);

    // Test 4: Check availability after first booking
    console.log('\n📊 TEST 4: Availability After First Booking');
    const conflictingAfter1 = await Reservation.find({
      tentType: 'standard',
      status: { $in: ['confirmed', 'pending'] },
      $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }]
    });
    
    const availableAfter1 = standardRooms.length - conflictingAfter1.length;
    console.log(`✅ Standard rooms now: ${availableAfter1} available (${conflictingAfter1.length} occupied)`);

    // Test 5: Try to create overlapping reservation (should work if rooms available)
    console.log('\n🔄 TEST 5: Create Overlapping Reservation');
    const reservation2 = new Reservation({
      bookingRef: 'TEST002',
      guestName: 'Jane Smith',
      guestEmail: 'jane@test.com',
      guestPhone: '+1234567891',
      checkIn: checkIn,
      checkOut: checkOut,
      guests: 2,
      tentType: 'standard',
      totalPrice: 240,
      status: 'confirmed',
      paymentStatus: 'paid'
    });
    
    if (availableAfter1 > 0) {
      await reservation2.save();
      console.log(`✅ Created overlapping reservation ${reservation2.bookingRef} - rooms still available`);
    } else {
      console.log(`❌ Cannot create overlapping reservation - no rooms available`);
    }

    // Test 6: Try to exceed capacity
    console.log('\n⚠️  TEST 6: Try to Exceed Room Capacity');
    const totalStandardRooms = standardRooms.length;
    let reservationsCreated = 2;
    
    for (let i = 3; i <= totalStandardRooms + 2; i++) {
      try {
        const testReservation = new Reservation({
          bookingRef: `TEST00${i}`,
          guestName: `Test Guest ${i}`,
          guestEmail: `test${i}@test.com`,
          guestPhone: `+123456789${i}`,
          checkIn: checkIn,
          checkOut: checkOut,
          guests: 2,
          tentType: 'standard',
          totalPrice: 240,
          status: 'confirmed',
          paymentStatus: 'paid'
        });
        
        // Check availability before saving
        const currentConflicts = await Reservation.find({
          tentType: 'standard',
          status: { $in: ['confirmed', 'pending'] },
          $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }]
        });
        
        if (currentConflicts.length >= totalStandardRooms) {
          console.log(`❌ Reservation ${i}: BLOCKED - All ${totalStandardRooms} standard rooms occupied`);
          break;
        } else {
          await testReservation.save();
          reservationsCreated++;
          console.log(`✅ Reservation ${i}: Created (${currentConflicts.length + 1}/${totalStandardRooms} rooms occupied)`);
        }
      } catch (error) {
        console.log(`❌ Reservation ${i}: Failed - ${error.message}`);
        break;
      }
    }

    // Test 7: Final availability check
    console.log('\n📈 TEST 7: Final Availability Check');
    const finalConflicts = await Reservation.find({
      tentType: 'standard',
      status: { $in: ['confirmed', 'pending'] },
      $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }]
    });
    
    const finalAvailable = totalStandardRooms - finalConflicts.length;
    console.log(`📊 Final Status: ${finalConflicts.length}/${totalStandardRooms} standard rooms occupied, ${finalAvailable} available`);

    // Test 8: Test different room types
    console.log('\n🏕️ TEST 8: Different Room Types Availability');
    const roomTypes = ['deluxe', 'suite', 'family', 'romantic', 'adventure'];
    
    for (const roomType of roomTypes) {
      const typeRooms = await Room.find({ roomType });
      const typeConflicts = await Reservation.find({
        tentType: roomType,
        status: { $in: ['confirmed', 'pending'] },
        $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }]
      });
      
      console.log(`   ${roomType}: ${typeRooms.length} total, ${typeConflicts.length} occupied, ${typeRooms.length - typeConflicts.length} available`);
    }

    console.log('\n🎉 ALL TESTS COMPLETED!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

runTests();