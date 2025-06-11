// Test script to verify API endpoints work correctly
const axios = require('axios');

// Base URL - change this to your Vercel deployment URL when testing production
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  try {
    // Test 1: Create a board
    console.log('\n1️⃣ Testing board creation...');
    const createBoardResponse = await axios.post(`${BASE_URL}/boards`, {
      name: 'Test Board'
    });
    
    const boardId = createBoardResponse.data._id;
    console.log('✅ Board created:', { id: boardId, name: createBoardResponse.data.name });
    
    // Test 2: Get the board
    console.log('\n2️⃣ Testing board retrieval...');
    const getBoardResponse = await axios.get(`${BASE_URL}/boards/${boardId}`);
    console.log('✅ Board retrieved:', { id: getBoardResponse.data._id, name: getBoardResponse.data.name });
    
    // Test 3: Create a card
    console.log('\n3️⃣ Testing card creation...');
    const createCardResponse = await axios.post(`${BASE_URL}/cards`, {
      boardId: boardId,
      title: 'Test Card',
      description: 'This is a test card',
      column: 'todo'
    });
    
    const cardId = createCardResponse.data._id;
    console.log('✅ Card created:', { id: cardId, title: createCardResponse.data.title });
    
    // Test 4: Move card
    console.log('\n4️⃣ Testing card movement...');
    const moveCardResponse = await axios.put(`${BASE_URL}/cards/${cardId}/move`, {
      column: 'inProgress',
      order: 0
    });
    console.log('✅ Card moved:', { column: moveCardResponse.data.column });
    
    // Test 5: Update card
    console.log('\n5️⃣ Testing card update...');
    const updateCardResponse = await axios.put(`${BASE_URL}/cards/${cardId}`, {
      title: 'Updated Test Card',
      description: 'Updated description'
    });
    console.log('✅ Card updated:', { title: updateCardResponse.data.title });
    
    // Test 6: Delete card
    console.log('\n6️⃣ Testing card deletion...');
    await axios.delete(`${BASE_URL}/cards/${cardId}`);
    console.log('✅ Card deleted successfully');
    
    // Test 7: Delete board
    console.log('\n7️⃣ Testing board deletion...');
    await axios.delete(`${BASE_URL}/boards/${boardId}`);
    console.log('✅ Board deleted successfully');
    
    console.log('\n🎉 All API tests passed! Your backend is working correctly.');
    
  } catch (error) {
    console.error('\n❌ API Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
  }
}

// Run the test
testAPI();
