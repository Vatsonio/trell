const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...');
  console.log('📍 Base URL:', BASE_URL);

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);

    // Test 2: Get initial boards
    console.log('2️⃣ Testing get boards...');
    const boardsResponse = await axios.get(`${BASE_URL}/boards`);
    console.log('✅ Get boards passed:', boardsResponse.data.length, 'boards found');

    // Test 3: Create a new board
    console.log('3️⃣ Testing board creation...');
    const newBoard = {
      name: 'Test Board ' + Date.now()
    };
    const createResponse = await axios.post(`${BASE_URL}/boards`, newBoard);
    console.log('✅ Board creation passed:', createResponse.data.name);
    const boardId = createResponse.data._id;

    // Test 4: Get specific board
    console.log('4️⃣ Testing get specific board...');
    const specificBoardResponse = await axios.get(`${BASE_URL}/boards/${boardId}`);
    console.log('✅ Get specific board passed:', specificBoardResponse.data.name);

    // Test 5: Create a card
    console.log('5️⃣ Testing card creation...');
    const newCard = {
      boardId: boardId,
      title: 'Test Card ' + Date.now(),
      description: 'This is a test card',
      column: 'todo'
    };
    const cardResponse = await axios.post(`${BASE_URL}/cards`, newCard);
    console.log('✅ Card creation passed:', cardResponse.data.title);
    const cardId = cardResponse.data._id;

    // Test 6: Get cards for board
    console.log('6️⃣ Testing get cards for board...');
    const cardsResponse = await axios.get(`${BASE_URL}/cards/board/${boardId}`);
    console.log('✅ Get cards passed:', cardsResponse.data.length, 'cards found');

    // Test 7: Update card
    console.log('7️⃣ Testing card update...');
    const updateCardData = {
      boardId: boardId,
      title: 'Updated Test Card',
      description: 'Updated description',
      column: 'inProgress'
    };
    const updateResponse = await axios.put(`${BASE_URL}/cards/${cardId}`, updateCardData);
    console.log('✅ Card update passed:', updateResponse.data.title);

    // Test 8: Update board
    console.log('8️⃣ Testing board update...');
    const updateBoardData = {
      name: 'Updated Board Name'
    };
    const updateBoardResponse = await axios.put(`${BASE_URL}/boards/${boardId}`, updateBoardData);
    console.log('✅ Board update passed:', updateBoardResponse.data.name);

    console.log('\n🎉 All API tests passed successfully!');

  } catch (error) {
    console.error('❌ API Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
  }
}

testAPI();
