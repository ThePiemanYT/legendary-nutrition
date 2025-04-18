window.onload = function () {
  document.getElementById('food').value = localStorage.getItem('food') || '';
  document.getElementById('weight').value = localStorage.getItem('weight') || '';
  document.getElementById('foodType').value = localStorage.getItem('foodType') || 'raw';

  document.getElementById('energy').textContent = (localStorage.getItem('energy') || "0");
  document.getElementById('fiber').textContent = (localStorage.getItem('fiber') || "0") + " g";
  document.getElementById('naturalBurnTime').textContent = (localStorage.getItem('naturalBurnTime') || "0") + " min";
  document.getElementById('walkTime').textContent = (localStorage.getItem('walkTime') || "0") + " min";
  document.getElementById('runTime').textContent = (localStorage.getItem('runTime') || "0") + " min";

  // Fetch the food data from the JSON file when the page loads
  fetch('/json/foodData.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load food data');
      }
      return response.json();
    })
    .then(data => {
      window.foodData = data; // Store the food data in a global variable
    })
    .catch(error => {
      console.error('Error loading food data:', error);
      alert('Failed to load food data. Please try refreshing the page.');
    });

  const chatDialog = document.createElement('dialog');
  chatDialog.id = 'chatDialog';
  chatDialog.innerHTML = `
    <p>The Live Chat Feature is currently under development.</p>
    <button onclick="closeChatMessage()" class="close-dia">Close</button>
  `;
  document.body.appendChild(chatDialog);
};

function getDisplayName(foodKey) {
  return window.foodData[foodKey]?.displayName || foodKey;
}

document.getElementById("food").addEventListener("input", function () {
  const query = this.value.trim().toLowerCase();
  const suggestionBox = document.getElementById("foodSuggestions");
  const foodTypeSelect = document.getElementById("foodType");

  if (!query) {
    suggestionBox.innerHTML = "";
    foodTypeSelect.style.display = "none";
    return;
  }

  let matchedFoods = Object.keys(window.foodData).filter(foodKey =>
    getDisplayName(foodKey).toLowerCase().includes(query)
  );

  suggestionBox.innerHTML = matchedFoods
    .map(foodKey => `<div class="suggestion" onclick="selectFood('${foodKey}')">${getDisplayName(foodKey)}</div>`)
    .join("");

  if (matchedFoods.length === 0) {
    suggestionBox.innerHTML = "<div class='no-match'>No suggestions found</div>";
  }
});

function selectFood(foodKey) {
  document.getElementById("food").value = getDisplayName(foodKey);
  document.getElementById("foodSuggestions").innerHTML = "";
  updateFoodTypeVisibility(foodKey);
}

function updateFoodTypeVisibility(foodKey) {
  const foodTypeSelect = document.getElementById("foodType");
  const foodTypeMain = document.getElementById("foodTypeMain");
  const food = window.foodData[foodKey];

  if (food && food.cooked) {
    foodTypeSelect.style.display = "block";
    foodTypeMain.style.display = "block";
  } else {
    foodTypeSelect.style.display = "none";
    foodTypeMain.style.display = "none";
    document.getElementById("foodType").value = "raw"; // Auto-select raw if cooked option is not available
  }
}

function calculateNutrition() {
  const foodItem = document.getElementById('food').value.trim();
  const weight = parseFloat(document.getElementById('weight').value);
  let foodType = document.getElementById('foodType').value;
  const foodError = document.getElementById('foodError');
  const weightError = document.getElementById('weightError');

  foodError.textContent = "";
  weightError.textContent = "";

  if (!foodItem) {
    foodError.textContent = "Food is required.";
    return;
  }

  if (!weight || weight <= 0) {
    weightError.textContent = "Can't calculate food under or equal 0g.";
    return;
  }

  if (!window.foodData) {
    foodError.textContent = "Food data is not loaded yet. Please try again later.";
    return;
  }

  const foodKey = Object.keys(window.foodData).find(key => getDisplayName(key) === foodItem);
  const food = window.foodData[foodKey];
  if (!food) {
    foodError.textContent = "Food is not on the list. Please select a valid food item.";
    return;
  }

  // Ensure raw is selected if cooked does not exist
  if (!food.cooked) {
    foodType = "raw";
  }

  const selectedFoodData = food[foodType];

  const energy = ((selectedFoodData.carbs * 4) + (selectedFoodData.protein * 4) + (selectedFoodData.fat * 9) + (selectedFoodData.fiber * 2)) * (weight / 100);
  const fiber = (selectedFoodData.fiber * weight) / 100;

  const { naturalBurnTime, walkTime, runTime } = calculateBurnTime(energy);

  document.getElementById('energy').textContent = energy.toFixed(2);
  document.getElementById('fiber').textContent = fiber.toFixed(2) + " g";
  document.getElementById('naturalBurnTime').textContent = naturalBurnTime.toFixed(2) + " min";
  document.getElementById('walkTime').textContent = walkTime.toFixed(2) + " min";
  document.getElementById('runTime').textContent = runTime.toFixed(2) + " min";

  localStorage.setItem('food', foodItem);
  localStorage.setItem('weight', weight);
  localStorage.setItem('foodType', foodType);
  localStorage.setItem('energy', energy.toFixed(2));
  localStorage.setItem('fiber', fiber.toFixed(2));
  localStorage.setItem('naturalBurnTime', naturalBurnTime.toFixed(2));
  localStorage.setItem('walkTime', walkTime.toFixed(2));
  localStorage.setItem('runTime', runTime.toFixed(2));
}

function calculateBurnTime(calories) {
  const naturalBurnCaloriesPerMin = 1.2;
  const walkCaloriesPerMin = 5;
  const runCaloriesPerMin = 10;
  
  const naturalBurnTime = calories / naturalBurnCaloriesPerMin;
  const walkTime = calories / walkCaloriesPerMin;
  const runTime = calories / runCaloriesPerMin;

  return { naturalBurnTime, walkTime, runTime };
}

function showChatMessage() {
  document.getElementById('chatDialog').showModal();
}

function closeChatMessage() {
  document.getElementById('chatDialog').close();
}
