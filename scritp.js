const searchBtn = document.getElementById("searchBtn");
const micBtn = document.getElementById("micBtn");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

const API_KEY = "1d072f15cc5d4484a31ac6dd8a2e67b2"; // Replace with your actual API key

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) return alert("Please enter ingredients!");
  fetchRecipes(query);
});

// 🎤 Voice Search
micBtn.addEventListener("click", () => {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    fetchRecipes(transcript);
  };
});

// 🔍 Fetch Recipes
async function fetchRecipes(query) {
  results.innerHTML = "🔄 Searching...";
  try {
    const res = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=3&apiKey=${API_KEY}`);
    const recipes = await res.json();

    results.innerHTML = "";

    for (let recipe of recipes) {
      const nutrition = await fetchNutrition(recipe.id);
      displayRecipe(recipe, nutrition);
    }

  } catch (err) {
    console.error(err);
    results.innerHTML = "❌ Error fetching recipes.";
  }
}

// 📊 Get Nutrition Info
async function fetchNutrition(recipeId) {
  const res = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.json?apiKey=${API_KEY}`);
  return await res.json();
}

// 🖼️ Display Recipe with Chart
function displayRecipe(recipe, nutrition) {
  const card = document.createElement("div");
  card.className = "recipe-card";

  card.innerHTML = `
    <h3>${recipe.title}</h3>
    <img src="${recipe.image}" alt="${recipe.title}">
    <p><strong>Used:</strong> ${recipe.usedIngredientCount}</p>
    <p><strong>Missing:</strong> ${recipe.missedIngredientCount}</p>
    <canvas id="chart-${recipe.id}"></canvas>
  `;

  results.appendChild(card);

  const ctx = document.getElementById(`chart-${recipe.id}`);
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Calories', 'Carbs', 'Protein', 'Fat'],
      datasets: [{
        data: [
          parseFloat(nutrition.calories),
          parseFloat(nutrition.carbs),
          parseFloat(nutrition.protein),
          parseFloat(nutrition.fat)
        ],
        backgroundColor: ['#ff6384', '#ffcd56', '#36a2eb', '#4bc0c0']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}
