/**
 * Test script to create a card with pickup code "2312" and verify it works
 */

import { createCard, findCardByPickupCode, updateCard } from './src/store/cardsStore.js';

// Create a test card with pickup code "2312"
const testCard = createCard({
    redId: '132264610',
    source: 'box',
    boxId: 'BOX_1',
    pickupCode: '2312',
    status: 'email_sent',
    email: 'ajasti7720@sdsu.edu',
    fullName: 'Test User'
});

console.log('✅ Test card created:');
console.log('   Card ID:', testCard.id);
console.log('   Pickup Code:', testCard.pickupCode);
console.log('   Box ID:', testCard.boxId);
console.log('   Status:', testCard.status);
console.log('');

// Test finding the card by pickup code
const foundCard = findCardByPickupCode('2312', 'BOX_1');
if (foundCard) {
    console.log('✅ Card found with pickup code "2312":');
    console.log('   Card ID:', foundCard.id);
    console.log('   Status:', foundCard.status);
    console.log('');
    console.log('✅ Pickup code "2312" is VALID and ready to test!');
    console.log('');
    console.log('Test it with Arduino or curl:');
    console.log('curl -X POST http://localhost:4000/api/pickup-request \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"pickupCode":"2312","boxId":"BOX_1"}\'');
} else {
    console.log('❌ Card not found - something went wrong');
}