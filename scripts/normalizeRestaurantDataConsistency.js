/* eslint-disable no-console */
const admin = require("firebase-admin");
const path = require("path");

const DEFAULT_LIMIT = 500;
const BATCH_SIZE = 200;
const MENU_KEYS = ["starters", "mains", "desserts", "drinks"];

const PLACEHOLDER_CITY_VALUES = new Set([
  "location not specified",
  "unknown",
  "n/a",
  "na",
  "none",
  "null",
  "undefined",
  "placeholder",
  "test",
]);

const parseArgs = () => {
  const args = process.argv.slice(2);
  const hasFlag = (flag) => args.includes(flag);
  const getValue = (prefix, fallback) => {
    const raw = args.find((item) => item.startsWith(`${prefix}=`));
    if (!raw) return fallback;
    return raw.slice(prefix.length + 1);
  };

  return {
    dryRun: !hasFlag("--apply"),
    limit: Number(getValue("--limit", String(DEFAULT_LIMIT))),
    serviceAccountPath: getValue("--service-account", "google-service.json"),
  };
};

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const hasValidUrl = (value) => /^https?:\/\//i.test(toText(value));

const normalizeForCompare = (value) =>
  toText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const isPlaceholderCity = (value) => PLACEHOLDER_CITY_VALUES.has(normalizeForCompare(value));

const titleCase = (value) =>
  toText(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const extractCityFromAddress = (address) => {
  const input = toText(address);
  if (!input) return "";

  const postcodeCityMatch = input.match(
    /([A-Za-z][A-Za-z\s'-]+)\s+[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i,
  );
  if (postcodeCityMatch?.[1]) {
    return titleCase(postcodeCityMatch[1]);
  }

  const segments = input.split(",").map((part) => part.trim()).filter(Boolean);
  if (segments.length < 2) return "";
  const fallback = segments[segments.length - 2];
  if (/\d/.test(fallback)) return "";
  return titleCase(fallback);
};

const isLikelySeedCoordinate = (lat, long) => {
  const latitude = Number(lat);
  const longitude = Number(long);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  const inUkBounds = latitude >= 49 && latitude <= 61 && longitude >= -9 && longitude <= 2;
  return !inUkBounds;
};

const isPlaceholderMenuEntry = (value, key) => {
  const text = toText(value);
  if (!text) return false;
  const patterns = {
    starters: /^starter\s+\d+$/i,
    mains: /^main\s+\d+$/i,
    desserts: /^dessert\s+\d+$/i,
    drinks: /^drink\s+\d+$/i,
  };
  return patterns[key]?.test(text) || false;
};

const isPlaceholderMenuArray = (arr, key) => {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.every((item) => typeof item === "string" && isPlaceholderMenuEntry(item, key));
};

const initializeAdmin = (serviceAccountPath) => {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  const absolutePath = path.resolve(process.cwd(), serviceAccountPath);
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const serviceAccount = require(absolutePath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return admin.firestore();
};

const buildPatch = (data) => {
  const patch = {};
  const reasons = [];

  const storageLogo = toText(data?.logoStorageUrl);
  const currentLogo = toText(data?.logo);
  if (hasValidUrl(storageLogo) && storageLogo !== currentLogo) {
    patch.logo = storageLogo;
    reasons.push("sync_logo_to_storage");
  }

  const currentCity = toText(data?.city);
  const parsedCity = extractCityFromAddress(data?.address);
  if (
    parsedCity &&
    (isPlaceholderCity(currentCity) ||
      !currentCity ||
      normalizeForCompare(currentCity) !== normalizeForCompare(parsedCity))
  ) {
    patch.city = parsedCity;
    reasons.push("city_from_address");
  }

  if (isLikelySeedCoordinate(data?.lat, data?.long)) {
    patch.lat = admin.firestore.FieldValue.delete();
    patch.long = admin.firestore.FieldValue.delete();
    reasons.push("clear_seed_coordinates");
  }

  MENU_KEYS.forEach((key) => {
    if (isPlaceholderMenuArray(data?.[key], key)) {
      patch[key] = [];
      reasons.push(`clear_placeholder_${key}`);
    }
  });

  if (reasons.length === 0) {
    return null;
  }

  patch.dataQualityNeedsReview = true;
  patch.lastNormalizedAt = admin.firestore.FieldValue.serverTimestamp();

  return { patch, reasons };
};

const run = async () => {
  const { dryRun, limit, serviceAccountPath } = parseArgs();
  const db = initializeAdmin(serviceAccountPath);
  const snap = await db.collection("restaurant").limit(limit).get();

  let scanned = 0;
  let patched = 0;
  let written = 0;
  const reasonCounts = {};
  const sample = [];

  let batch = db.batch();
  let pendingWrites = 0;

  for (const docSnap of snap.docs) {
    scanned += 1;
    const built = buildPatch(docSnap.data() || {});
    if (!built) continue;

    patched += 1;
    built.reasons.forEach((reason) => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    sample.push({
      id: docSnap.id,
      reasons: built.reasons,
      patchKeys: Object.keys(built.patch),
    });

    if (!dryRun) {
      batch.update(docSnap.ref, built.patch);
      pendingWrites += 1;
      if (pendingWrites >= BATCH_SIZE) {
        await batch.commit();
        written += pendingWrites;
        batch = db.batch();
        pendingWrites = 0;
      }
    }
  }

  if (!dryRun && pendingWrites > 0) {
    await batch.commit();
    written += pendingWrites;
  }

  console.log(
    JSON.stringify(
      {
        scanned,
        patched,
        written,
        dryRun,
        inspectedLimit: limit,
        reasonCounts,
      },
      null,
      2,
    ),
  );
  console.log("\nSample results:");
  sample.slice(0, 40).forEach((row) => console.log(row));
};

run().catch((error) => {
  console.error("Normalization failed:", error.message);
  process.exit(1);
});
