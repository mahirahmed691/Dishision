const QUERY_STOPWORDS = new Set([
  "find",
  "me",
  "something",
  "i",
  "want",
  "show",
  "options",
  "option",
  "on",
  "this",
  "menu",
  "the",
  "a",
  "an",
  "for",
  "to",
  "with",
  "and",
  "or",
  "please",
  "give",
  "need",
]);

const SYNONYM_MAP = {
  hot: ["spicy", "chilli", "chili", "pepper", "jalapeno", "buffalo"],
  spicy: ["hot", "chilli", "chili", "pepper", "jalapeno"],
  cheesy: ["cheese", "cheddar", "mozzarella", "parmesan", "mac"],
  crispy: ["fried", "crunchy", "golden"],
  creamy: ["cream", "cheese", "butter", "mayo", "sauce"],
  light: ["fresh", "salad", "grilled", "small"],
  sweet: ["dessert", "cake", "milkshake", "ice", "chocolate"],
};

const TAG_KEYWORD_MAP = {
  spicy: ["spicy", "nashville", "jalapeno", "habanero", "buffalo", "hot"],
  cheesy: ["cheese", "cheesy", "mac", "cheddar", "mozzarella", "parmesan"],
  crispy: ["crispy", "fried", "crunchy", "tenders", "wings", "fries"],
  creamy: ["cream", "creamy", "mayo", "sauce", "truffle", "milkshake"],
  smoky: ["bbq", "smokey", "smoky", "chipotle", "grill"],
  sweet: ["dessert", "chocolate", "lotus", "toffee", "shake", "sweet"],
  light: ["salad", "water", "tea", "falafel", "fresh"],
};

const SECTION_HINT_MAP = {
  starters: ["starter", "starters", "appetizer", "appetizers", "small", "side", "sides"],
  mains: ["main", "mains", "meal", "burger", "sandwich", "sando", "curry", "pasta", "rice"],
  desserts: ["dessert", "desserts", "sweet", "cake", "ice", "icecream", "pudding", "shake", "waffle"],
  drinks: ["drink", "drinks", "juice", "cola", "water", "tea", "coffee", "mocktail", "fizzy"],
};

export const FALLBACK_PROMPT_IDEAS = [
  "Find me something hot and cheesy.",
  "What should I order if I want a spicy main?",
  "Show me the most popular comfort-food item.",
  "Suggest a crispy and flavorful option.",
  "I want something light but satisfying.",
];

export const normalizeToken = (value) =>
  `${value || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const tokenizeText = (value) =>
  `${value || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

export const levenshteinDistance = (a, b) => {
  if (a === b) {
    return 0;
  }
  if (!a.length) {
    return b.length;
  }
  if (!b.length) {
    return a.length;
  }

  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
};

export const findClosestToken = (token, vocabulary) => {
  if (!token || !vocabulary.length) {
    return null;
  }

  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  vocabulary.forEach((candidate) => {
    const distance = levenshteinDistance(token, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  });

  const threshold = token.length <= 4 ? 1 : 2;
  return bestDistance <= threshold ? best : null;
};

export const extractMenuVocabulary = (menuItems) =>
  Array.from(
    new Set(
      menuItems
        .flatMap((item) =>
          tokenizeText(`${item?.name || ""} ${item?.description || ""}`),
        )
        .map(normalizeToken)
        .filter((token) => token.length > 2),
    ),
  );

export const extractSearchTokens = (rawTokens, vocabulary) => {
  const base = rawTokens.filter(
    (token) => token.length > 1 && !QUERY_STOPWORDS.has(token),
  );
  const expanded = new Set(base.map(normalizeToken).filter(Boolean));

  base.forEach((token) => {
    const normalizedToken = normalizeToken(token);
    if (!normalizedToken) {
      return;
    }

    const corrected = findClosestToken(normalizedToken, vocabulary);
    if (corrected) {
      expanded.add(corrected);
    }

    (SYNONYM_MAP[normalizedToken] || []).forEach((synonym) => {
      const normalizedSynonym = normalizeToken(synonym);
      expanded.add(normalizedSynonym);
      const correctedSynonym = findClosestToken(normalizedSynonym, vocabulary);
      if (correctedSynonym) {
        expanded.add(correctedSynonym);
      }
    });
  });

  return Array.from(expanded).filter((token) => token.length > 1);
};

export const getLocalSuggestions = (allMenuItems, queryTokens) => {
  if (!Array.isArray(allMenuItems) || allMenuItems.length === 0) {
    return [];
  }

  const tokenSet = new Set((queryTokens || []).map(normalizeToken).filter(Boolean));
  const hintedSections = new Set();
  Object.entries(SECTION_HINT_MAP).forEach(([section, keywords]) => {
    if (keywords.some((keyword) => tokenSet.has(normalizeToken(keyword)))) {
      hintedSections.add(section);
    }
  });

  const scoreItem = (item) => {
    const sourceTokens = tokenizeText(
      `${item?.name || ""} ${item?.description || ""}`,
    ).map(normalizeToken);
    const sourceSet = new Set(sourceTokens);
    let score = 0;

    (queryTokens || []).forEach((token) => {
      if (sourceSet.has(token)) {
        score += 2;
        return;
      }
      const closest = findClosestToken(token, sourceTokens);
      if (closest) {
        score += 1;
      }
    });

    if (hintedSections.has(item?.section)) {
      score += 1.5;
    }
    if (item?.section === "mains") {
      score += 0.2;
    }

    return score;
  };

  const scored = allMenuItems
    .map((item) => ({ ...item, _score: scoreItem(item) }))
    .filter((item) => item._score > 0)
    .sort((a, b) => b._score - a._score);

  if (scored.length > 0) {
    return scored;
  }

  if (hintedSections.size > 0) {
    const fromHintedSections = allMenuItems
      .filter((item) => hintedSections.has(item?.section))
      .slice(0, 6)
      .map((item) => ({ ...item, _score: 0 }));
    if (fromHintedSections.length > 0) {
      return fromHintedSections;
    }
  }

  return allMenuItems
    .filter((item) => item.section === "mains" || item.section === "starters")
    .slice(0, 6)
    .map((item) => ({ ...item, _score: 0 }));
};

export const getDynamicRefineTags = (allMenuItems, queryTokens = []) => {
  const menuText = allMenuItems
    .map((item) => `${item.name} ${item.description}`.toLowerCase())
    .join(" ");

  const rankedTags = Object.entries(TAG_KEYWORD_MAP)
    .map(([tag, keywords]) => ({
      tag,
      score: keywords.reduce(
        (total, keyword) => total + (menuText.includes(keyword) ? 1 : 0),
        0,
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.tag);

  const sectionTags = [];
  if (allMenuItems.some((item) => item.section === "starters")) {
    sectionTags.push("starters");
  }
  if (allMenuItems.some((item) => item.section === "mains")) {
    sectionTags.push("mains");
  }
  if (allMenuItems.some((item) => item.section === "desserts")) {
    sectionTags.push("desserts");
  }
  if (allMenuItems.some((item) => item.section === "drinks")) {
    sectionTags.push("drinks");
  }

  const prioritized = queryTokens
    .filter((token) => rankedTags.includes(token))
    .slice(0, 2);

  return Array.from(new Set([...prioritized, ...rankedTags, ...sectionTags])).slice(0, 6);
};

export const getDynamicPromptIdeas = ({ hasAnyMenuItems, dynamicRefineTags }) => {
  if (!hasAnyMenuItems) {
    return FALLBACK_PROMPT_IDEAS;
  }

  const prompts = [];
  if (dynamicRefineTags.includes("spicy")) {
    prompts.push("Find me the best spicy option on this menu.");
  }
  if (dynamicRefineTags.includes("cheesy")) {
    prompts.push("What is the cheesiest item worth ordering?");
  }
  if (dynamicRefineTags.includes("mains")) {
    prompts.push("What main should I get if I am really hungry?");
  }
  if (dynamicRefineTags.includes("starters")) {
    prompts.push("Suggest a starter that pairs well with a main.");
  }
  if (dynamicRefineTags.includes("desserts")) {
    prompts.push("Show me the top dessert pick from this menu.");
  }
  if (dynamicRefineTags.includes("drinks")) {
    prompts.push("Recommend a drink that fits this order.");
  }

  return Array.from(new Set([...prompts, ...FALLBACK_PROMPT_IDEAS])).slice(0, 5);
};

export const filterMenuItemsByQuery = (items, queryTokens) => {
  if (!queryTokens.length) {
    return items;
  }

  return items.filter((item) => {
    const haystackTokens = tokenizeText(
      `${item?.name ?? ""} ${item?.description ?? item?.descriptions ?? ""}`,
    ).map(normalizeToken);

    return queryTokens.some((token) => {
      if (haystackTokens.includes(token)) {
        return true;
      }
      return Boolean(findClosestToken(token, haystackTokens));
    });
  });
};

export const deriveTopPickNames = ({
  allMenuItems,
  parsedApiSuggestions,
  localSuggestions,
}) => {
  const normalize = (value) =>
    `${value || ""}`
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const bestMenuMatch = (suggestion) => {
    const normalizedSuggestion = normalize(suggestion);
    if (!normalizedSuggestion) {
      return null;
    }

    const suggestionTokens = normalizedSuggestion
      .split(" ")
      .filter((token) => token.length > 2);

    let best = null;
    let bestScore = 0;

    allMenuItems.forEach((menuItem) => {
      const normalizedMenuName = normalize(menuItem.name);
      const normalizedMenuDesc = normalize(menuItem.description || "");
      const haystack = `${normalizedMenuName} ${normalizedMenuDesc}`;

      let score = 0;
      if (normalizedMenuName.includes(normalizedSuggestion)) {
        score += 6;
      }
      if (normalizedSuggestion.includes(normalizedMenuName)) {
        score += 3;
      }
      suggestionTokens.forEach((token) => {
        if (haystack.includes(token)) {
          score += 1;
        }
      });
      const menuNameTokens = normalizedMenuName
        .split(" ")
        .filter((token) => token.length > 1);
      const overlap = suggestionTokens.filter((token) => menuNameTokens.includes(token))
        .length;
      score += overlap * 1.2;

      const editDistance = levenshteinDistance(normalizedSuggestion, normalizedMenuName);
      const maxLen = Math.max(normalizedSuggestion.length, normalizedMenuName.length) || 1;
      const similarity = 1 - editDistance / maxLen;
      if (similarity >= 0.72) {
        score += similarity * 3.2;
      }

      if (score > bestScore) {
        bestScore = score;
        best = menuItem.name;
      }
    });

    return bestScore >= 1.4 ? best : null;
  };

  const matchedFromApi = parsedApiSuggestions
    .map((item) => bestMenuMatch(item))
    .filter(Boolean);

  const uniqueApiMatches = Array.from(new Set(matchedFromApi));
  if (uniqueApiMatches.length > 0) {
    return uniqueApiMatches.slice(0, 4);
  }

  const uniqueLocalMatches = Array.from(
    new Set((localSuggestions || []).map((item) => item?.name).filter(Boolean)),
  ).slice(0, 4);
  if (uniqueLocalMatches.length > 0) {
    return uniqueLocalMatches;
  }

  return Array.from(
    new Set((allMenuItems || []).map((item) => item?.name).filter(Boolean)),
  ).slice(0, 4);
};
