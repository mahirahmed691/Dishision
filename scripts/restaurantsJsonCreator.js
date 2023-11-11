const fs = require('fs');

function generateRestaurantData(restaurantNames, existingRestaurants) {
  const locations = ["Manchester", "London", "Birmingham", "Leeds", "Bradford", "Stoke"]; // Array of location names
  const cuisines = [
    "Italian", "Mexican", "Chinese", "Indian", "American", "Japanese",
    "French", "Thai", "Mediterranean", "Spanish", "Greek", "German",
    "Korean", "Vietnamese", "Brazilian", "Turkish", "Caribbean", "Moroccan",
    "Lebanese", "Sushi", "Peruvian", "Russian", "Tex-Mex", "Argentinian",
    "Irish", "Malaysian", "Ethiopian", "African", "Portuguese", "Swiss"
  ]; // Array of cuisines

  const restaurants = existingRestaurants ? existingRestaurants : [];
  for (const name of restaurantNames) {
    const trimmedName = name.trim();
    if (trimmedName !== "") {
      const exists = restaurants.some(restaurant => restaurant.restaurantName === trimmedName);
      if (!exists) {
        const locationIndex = Math.floor(Math.random() * locations.length); // Random index for selecting location
        const randomLocation = locations[locationIndex]; // Get the randomly selected location

        const cuisineIndex = Math.floor(Math.random() * cuisines.length); // Random index for selecting cuisine
        const randomCuisine = cuisines[cuisineIndex]; // Get the randomly selected cuisine

        const restaurant = {
          restaurantName: trimmedName,
          address: "Address Placeholder",
          logo:"https://static.wixstatic.com/media/bf242e_6133b4ae6a104cc2b50d70179f35efea~mv2.jpg/v1/fill/w_500,h_376,al_c,lg_1,q_80,enc_auto/food-placeholder.jpg",
          isHalal: false,
          hygiene: Number((Math.random() * (5 - 1) + 1).toFixed(1)), // Random hygiene with one decimal point
          rating: Number((Math.random() * (5 - 1) + 1).toFixed(1)), // Random rating with one decimal point
          cuisine: randomCuisine, // Randomly selected cuisine from the cuisines array
          city: randomLocation, // Randomly selected city from the locations array
          starters: ["Starter 1", "Starter 2", "Starter 3"],
          mains: ["Main 1", "Main 2", "Main 3"],
          desserts: ["Dessert 1", "Dessert 2", "Dessert 3"],
          drinks: ["Drink 1", "Drink 2", "Drink 3"],
          vegan: Math.random() < 0.5,
          long: Math.random() * 360 - 180,
          lat: Math.random() * 180 - 90
        };
        restaurants.push(restaurant);
      }
    }
  }
  return restaurants;
}

fs.readFile('restaurantNames.txt', 'utf8', (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    process.exit(1);
  }

  fs.readFile('restaurantsOutput.json', 'utf8', (err, existingData) => {
    let existingRestaurants = [];
    if (!err) {
      try {
        existingRestaurants = JSON.parse(existingData);
      } catch (err) {
        console.error("Error parsing existing data:", err);
      }
    }

    const restaurantNames = data.split('\n');
    const restaurants = generateRestaurantData(restaurantNames, existingRestaurants);
    const jsonRestaurants = JSON.stringify(restaurants, null, 2);

    fs.writeFile('restaurantsOutput.json', jsonRestaurants, err => {
      if (err) {
        console.error("Error writing to the file:", err);
        process.exit(1);
      }
      console.log('Restaurants data saved to restaurantsOutput.json');
    });
  });
});
