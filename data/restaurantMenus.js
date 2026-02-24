const ARCHIES_MENU = {
  restaurantName: "Archies",
  starters: [
    { name: "Mac & Cheese Bites", price: "4.95", description: "Crispy fried mac and cheese bites." },
    { name: "Cheesy Tots", price: "4.95", description: "Crispy potato tots topped with cheese sauce." },
    { name: "Cheese Fries", price: "4.95", description: "Skin on fries with melted cheese sauce." },
    { name: "Truffle Fries", price: "5.25", description: "Skin on fries tossed in truffle mayo." },
    { name: "Skin on Fries", price: "3.90", description: "Seasoned skin on fries." },
    { name: "Chicken Wings - Nashville", price: "3 for 4.50 / 5 for 6.90", description: "Buttermilk fried wings in nashville sauce." },
    { name: "Chicken Wings - Buffalo Hot", price: "3 for 4.50 / 5 for 6.90", description: "Buttermilk fried wings in buffalo hot sauce." },
    { name: "Chicken Wings - Honey Chipotle BBQ", price: "3 for 4.50 / 5 for 6.90", description: "Buttermilk fried wings in honey chipotle BBQ." },
    { name: "Chicken Wings - Mango Habanero", price: "3 for 4.50 / 5 for 6.90", description: "Buttermilk fried wings in mango habanero." },
    { name: "Chicken Tenders - Nashville", price: "3 for 6.90", description: "Buttermilk tenders in nashville sauce." },
    { name: "Chicken Tenders - Buffalo Hot", price: "3 for 6.90", description: "Buttermilk tenders in buffalo hot sauce." },
    { name: "Chicken Tenders - Honey Chipotle BBQ", price: "3 for 6.90", description: "Buttermilk tenders in honey chipotle BBQ." },
    { name: "Chicken Tenders - Mango Habanero", price: "3 for 6.90", description: "Buttermilk tenders in mango habanero." },
  ],
  mains: [
    { name: "Superstar", price: "8.50", description: "Classic smashed beef burger with cheese, lettuce, pickles and star sauce." },
    { name: "Route 66", price: "10.00", description: "Two smashed patties, turkey bacon, BBQ sauce, onions and lettuce." },
    { name: "Good Burger", price: "12.00", description: "Three smashed beef patties, cheese, lettuce, pickles and onions." },
    { name: "Royale with Cheese", price: "9.00", description: "Two smashed patties with cheese sauce, lettuce and pickles." },
    { name: "Jalapeno Burger", price: "9.50", description: "Two smashed patties with jalapenos, hot cheese and crispy onions." },
    { name: "Truffle Burger", price: "9.50", description: "Two smashed patties with truffle mayo, cheese and crispy shallots." },
    { name: "Bacon Jam Burger", price: "11.50", description: "Two smashed patties with bacon jam, ranch sauce and crispy shallots." },
    { name: "Falafel Burger", price: "7.50", description: "Falafel patty with mint yogurt, tomato and lettuce." },
    { name: "Deluxe", price: "8.00", description: "Chicken fillet burger with lettuce and house sauce." },
    { name: "Cheetos", price: "8.00", description: "Buttermilk chicken with crushed Cheetos and cheese sauce." },
    { name: "Nashville", price: "8.00", description: "Buttermilk chicken in nashville coating with lettuce." },
    { name: "Hot Honey Burger", price: "8.50", description: "Buttermilk chicken with hot honey sauce, dynamite sauce and lettuce." },
    { name: "Nashville Sando", price: "9.00", description: "Buttermilk chicken in nashville coating with pickle and brioche." },
    { name: "Little Archies", price: "6.00", description: "One smashed beef patty with star sauce, cheese and potato bun." },
    { name: "Ramen Noodles", price: "3.80", description: "Shaker fries seasoning: ramen noodles flavor." },
    { name: "Nashville Hot", price: "3.80", description: "Shaker fries seasoning: nashville hot flavor." },
    { name: "Sweet Churros", price: "3.80", description: "Shaker fries seasoning: sweet churros flavor." },
    { name: "Hot Honey", price: "3.80", description: "Shaker fries seasoning: hot honey flavor." },
    { name: "Smokey BBQ", price: "3.80", description: "Shaker fries seasoning: smokey BBQ flavor." },
    { name: "Mango Habanero", price: "3.80", description: "Shaker fries seasoning: mango habanero flavor." },
  ],
  desserts: [
    { name: "Softie Cup - Pistachio Crunch", price: "3.50", description: "Soft serve with pistachio crunch topping." },
    { name: "Softie Cup - Chocolate Toffee & Nuts", price: "3.50", description: "Soft serve with chocolate toffee nuts." },
    { name: "Softie Cup - Lotus", price: "3.50", description: "Soft serve with lotus topping." },
    { name: "Waffle - Pistachio Crunch", price: "4.50", description: "Warm waffle with pistachio sauce, whipped cream and wafer." },
    { name: "Waffle - Strawberry Chocolate", price: "4.50", description: "Warm waffle with strawberry chocolate sauce and wafer." },
    { name: "Waffle - Kinder & White Chocolate", price: "4.50", description: "Warm waffle with kinder bueno and white chocolate." },
    { name: "Thick Shake - Pistachio Crunch", price: "6.50 / 7.50", description: "Milkshake with pistachio sauce and ice cream." },
    { name: "Thick Shake - Bryson Tiller", price: "6.50 / 7.50", description: "Oreos, crunchy pearls, toffee and ice cream." },
    { name: "Thick Shake - Lotus", price: "6.50 / 7.50", description: "Lotus biscuit shake with lotus sauce." },
    { name: "Thick Shake - Breezey", price: "6.50 / 7.50", description: "Oreo, vanilla ice cream and brownie crumb." },
    { name: "Thick Shake - Cookies & Cream", price: "6.50 / 7.50", description: "Cookies milkshake with ice cream." },
    { name: "Thick Shake - Million Dollar", price: "6.50 / 7.50", description: "Ferrero Rocher style shake." },
    { name: "Thick Shake - Ora-Licious", price: "6.50 / 7.50", description: "Oreos and chocolate hazelnut sauce." },
    { name: "Thick Shake - The Moonwalker", price: "6.50 / 7.50", description: "Maltesers style shake." },
  ],
  drinks: [
    { name: "Pink Lemonade", price: "3.30 / 3.80", description: "Soft drink." },
    { name: "Cola", price: "3.30 / 3.80", description: "Soft drink." },
    { name: "Cola Lite", price: "3.30 / 3.80", description: "Soft drink." },
    { name: "Good Orange Soda", price: "3.30 / 3.80", description: "Soft drink." },
    { name: "Irn Bru", price: "3.30 / 3.80", description: "Soft drink." },
    { name: "Vimto", price: "3.30 / 3.80", description: "Soft drink." },
    { name: "Bottled Water", price: "2.20", description: "Still water." },
    { name: "Latte", price: "2.00", description: "Hot drink." },
    { name: "Cappuccino", price: "2.00", description: "Hot drink." },
    { name: "Americano", price: "2.00", description: "Hot drink." },
    { name: "Espresso", price: "2.00", description: "Hot drink." },
    { name: "Breakfast Tea", price: "2.00", description: "Hot drink." },
  ],
};

const normalizeName = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const getRestaurantFallbackMenu = (restaurantName) => {
  const normalizedName = normalizeName(restaurantName);

  if (normalizedName.includes("archie")) {
    return ARCHIES_MENU;
  }

  return null;
};

export { ARCHIES_MENU };
