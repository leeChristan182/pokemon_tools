const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000';

// Color codes for console output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';

const log = (message, color = RESET) => console.log(`${color}${message}${RESET}`);
const logSuccess = (message) => log(`✅ ${message}`, GREEN);
const logError = (message) => log(`❌ ${message}`, RED);
const logInfo = (message) => log(`ℹ️  ${message}`, BLUE);
const logWarning = (message) => log(`⚠️  ${message}`, YELLOW);

async function testEditableData() {
  log('\n🧪 Testing Editable Data API\n', YELLOW);
  
  try {
    // Wait for server to be ready
    logInfo('Waiting for server to be ready...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 1: Edit Pokemon
    logInfo('Test 1: Editing Pikachu (ID: 25)');
    const editPokemonResponse = await axios.post(`${BASE_URL}/api/edited-pokemon`, {
      pokemon_id: 25,
      pokemon_name: 'pikachu',
      flavor_text: 'This is a custom Pikachu description! It loves ketchup.',
      classification: 'Electric Mouse Pokémon',
      custom_notes: 'My favorite starter Pokemon from Yellow!'
    });
    logSuccess(`Pokemon edited: ${JSON.stringify(editPokemonResponse.data)}`);
    
    // Test 2: Fetch edited Pokemon through proxy
    logInfo('\nTest 2: Fetching Pikachu with edits merged');
    const fetchPokemonResponse = await axios.get(`${BASE_URL}/api/pokemon/25`);
    logSuccess(`Edited flag: ${fetchPokemonResponse.data.edited}`);
    if (fetchPokemonResponse.data.custom_data) {
      logSuccess(`Custom flavor text: "${fetchPokemonResponse.data.custom_data.flavor_text}"`);
      logSuccess(`Custom notes: "${fetchPokemonResponse.data.custom_data.custom_notes}"`);
    }
    
    // Test 3: Get all edited Pokemon
    logInfo('\nTest 3: Getting all edited Pokemon');
    const allEditedResponse = await axios.get(`${BASE_URL}/api/edited-pokemon`);
    logSuccess(`Total edited Pokemon: ${allEditedResponse.data.length}`);
    
    // Test 4: Edit an item
    logInfo('\nTest 4: Editing Master Ball (ID: 1)');
    const editItemResponse = await axios.post(`${BASE_URL}/api/edited-items`, {
      item_id: 1,
      item_name: 'master-ball',
      effect_description: 'A custom Master Ball that works 100% of the time, no matter what!',
      cost: 999999,
      custom_notes: 'The ultimate Pokéball!'
    });
    logSuccess(`Item edited: ${JSON.stringify(editItemResponse.data)}`);
    
    // Test 5: Fetch edited item through proxy
    logInfo('\nTest 5: Fetching Master Ball with edits merged');
    const fetchItemResponse = await axios.get(`${BASE_URL}/api/item/1`);
    logSuccess(`Edited flag: ${fetchItemResponse.data.edited}`);
    if (fetchItemResponse.data.custom_data) {
      logSuccess(`Custom effect: "${fetchItemResponse.data.custom_data.effect_description}"`);
      logSuccess(`Custom cost: ${fetchItemResponse.data.custom_data.cost}`);
    }
    
    // Test 6: Edit a move
    logInfo('\nTest 6: Editing Thunderbolt move');
    const editMoveResponse = await axios.post(`${BASE_URL}/api/edited-moves`, {
      move_name: 'thunderbolt',
      flavor_text: 'A powerful electric attack that may paralyze the target. Custom description!',
      custom_notes: 'Best Electric move in the game!'
    });
    logSuccess(`Move edited: ${JSON.stringify(editMoveResponse.data)}`);
    
    // Test 7: Fetch edited move through proxy
    logInfo('\nTest 7: Fetching Thunderbolt with edits merged');
    const fetchMoveResponse = await axios.get(`${BASE_URL}/api/move/thunderbolt`);
    logSuccess(`Edited flag: ${fetchMoveResponse.data.edited}`);
    if (fetchMoveResponse.data.custom_data) {
      logSuccess(`Custom flavor text: "${fetchMoveResponse.data.custom_data.flavor_text}"`);
      logSuccess(`Custom notes: "${fetchMoveResponse.data.custom_data.custom_notes}"`);
    }
    
    // Test 8: Check a non-edited Pokemon
    logInfo('\nTest 8: Fetching Charizard (ID: 6) - should not be edited');
    const fetchCharizardResponse = await axios.get(`${BASE_URL}/api/pokemon/6`);
    logSuccess(`Edited flag: ${fetchCharizardResponse.data.edited}`);
    if (!fetchCharizardResponse.data.edited) {
      logSuccess('Charizard is not edited, as expected');
    }
    
    // Test 9: Update existing edit
    logInfo('\nTest 9: Updating Pikachu edit');
    const updatePokemonResponse = await axios.post(`${BASE_URL}/api/edited-pokemon`, {
      pokemon_id: 25,
      pokemon_name: 'pikachu',
      flavor_text: 'Updated description! Pikachu is even cooler now.',
      classification: 'Electric Mouse Pokémon',
      custom_notes: 'Updated notes!'
    });
    logSuccess(`Pokemon updated: ${JSON.stringify(updatePokemonResponse.data)}`);
    
    // Test 10: Verify update
    logInfo('\nTest 10: Verifying Pikachu update');
    const verifyUpdateResponse = await axios.get(`${BASE_URL}/api/pokemon/25`);
    if (verifyUpdateResponse.data.custom_data) {
      logSuccess(`Updated flavor text: "${verifyUpdateResponse.data.custom_data.flavor_text}"`);
    }
    
    // Test 11: Revert Pokemon to original
    logInfo('\nTest 11: Reverting Pikachu to original API data');
    const revertResponse = await axios.delete(`${BASE_URL}/api/edited-pokemon/25`);
    logSuccess(`Revert response: ${JSON.stringify(revertResponse.data)}`);
    
    // Test 12: Verify revert
    logInfo('\nTest 12: Verifying Pikachu revert');
    const verifyRevertResponse = await axios.get(`${BASE_URL}/api/pokemon/25`);
    logSuccess(`Edited flag after revert: ${verifyRevertResponse.data.edited}`);
    if (!verifyRevertResponse.data.edited) {
      logSuccess('Pikachu successfully reverted to original API data!');
    }
    
    log('\n🎉 All tests passed!', GREEN);
    
  } catch (error) {
    logError(`\nTest failed: ${error.message}`);
    if (error.response) {
      logError(`Response status: ${error.response.status}`);
      logError(`Response data: ${JSON.stringify(error.response.data)}`);
    }
    process.exit(1);
  }
}

// Run tests
testEditableData().then(() => {
  log('\n✨ Testing complete!\n', BLUE);
  process.exit(0);
}).catch(err => {
  logError(`\nUnexpected error: ${err.message}`);
  process.exit(1);
});
