import { useEffect, useState } from "react";
import { resolveRestaurantMenuData } from "../services/restaurantDataService";

const buildDevMenuFallback = (restaurantName) => ({
  restaurantName,
  starters: [
    { name: "Garlic Bread", price: "6", description: "Toasted, buttery, and warm." },
    { name: "Loaded Fries", price: "7", description: "Crispy fries with house sauce." },
  ],
  mains: [
    {
      name: "Spicy Chicken Burger",
      price: "14",
      description: "Hot, crispy chicken with melted cheese.",
    },
    {
      name: "Cheesy Beef Burger",
      price: "15",
      description: "Beef patty, cheddar, pickles, and sauce.",
    },
  ],
  desserts: [
    {
      name: "Chocolate Brownie",
      price: "6",
      description: "Rich brownie with vanilla ice cream.",
    },
  ],
  drinks: [
    {
      name: "Lemon Iced Tea",
      price: "4",
      description: "Freshly brewed and lightly sweet.",
    },
  ],
});

export const useRestaurantMenuData = (restaurant) => {
  const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    const fetchRestaurantMenuData = async () => {
      try {
        const resolvedRestaurant = await resolveRestaurantMenuData({
          restaurantName: restaurant.restaurantName,
          seedRestaurant: restaurant,
          devMenuFactory: () => buildDevMenuFallback(restaurant.restaurantName),
        });
        setMenuData(resolvedRestaurant);
      } catch (fetchError) {
        console.error("Error retrieving restaurant menu data:", fetchError);
        if (__DEV__) {
          setMenuData(buildDevMenuFallback(restaurant.restaurantName));
        }
      }
    };

    fetchRestaurantMenuData();
  }, [restaurant]);

  return {
    menuData,
  };
};

export default useRestaurantMenuData;
