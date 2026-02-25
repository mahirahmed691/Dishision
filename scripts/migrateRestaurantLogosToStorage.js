/* eslint-disable no-console */
const admin = require("firebase-admin");
const axios = require("axios");
const path = require("path");
const crypto = require("crypto");

const DEFAULT_LIMIT = 200;
const BATCH_SIZE = 100;

const parseArgs = () => {
  const args = process.argv.slice(2);
  const hasFlag = (flag) => args.includes(flag);
  const getValue = (prefix, fallback) => {
    const raw = args.find((item) => item.startsWith(`${prefix}=`));
    if (!raw) {
      return fallback;
    }
    return raw.slice(prefix.length + 1);
  };

  return {
    dryRun: !hasFlag("--apply"),
    force: hasFlag("--force"),
    allowFavicon: hasFlag("--allow-favicon"),
    limit: Number(getValue("--limit", String(DEFAULT_LIMIT))),
    serviceAccountPath: getValue("--service-account", "google-service.json"),
  };
};

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const hasValidUrl = (value) => /^https?:\/\//i.test(toText(value));

const sanitizeId = (value) =>
  toText(value)
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");

const hostnameFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./i, "");
  } catch (_error) {
    return "";
  }
};

const domainFromClearbitUrl = (url) => {
  const raw = toText(url);
  if (!raw.includes("logo.clearbit.com/")) {
    return "";
  }
  const domain = raw.split("logo.clearbit.com/")[1] || "";
  return domain.split(/[/?#]/)[0].trim().replace(/^www\./i, "");
};

const isFaviconLikeUrl = (url) => {
  const value = toText(url).toLowerCase();
  if (!value) return false;
  return (
    value.includes("www.google.com/s2/favicons") ||
    value.includes("icons.duckduckgo.com/ip3/") ||
    value.endsWith(".ico")
  );
};

const resolveUrl = (baseUrl, maybeRelativeUrl) => {
  const value = toText(maybeRelativeUrl);
  if (!value) return "";
  try {
    return new URL(value, baseUrl).toString();
  } catch (_error) {
    return "";
  }
};

const collectMatches = (html, regex) => {
  const results = [];
  let match = regex.exec(html);
  while (match) {
    const value = toText(match[1] || "");
    if (value) {
      results.push(value);
    }
    match = regex.exec(html);
  }
  return results;
};

const fetchWebsiteImageCandidates = async (websiteUrl) => {
  const target = toText(websiteUrl);
  if (!hasValidUrl(target)) {
    return [];
  }

  const response = await axios.get(target, {
    timeout: 12000,
    maxRedirects: 3,
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "DishisionLogoMigrator/1.0",
    },
    validateStatus: (status) => status >= 200 && status < 400,
  });

  const html = String(response?.data || "");
  if (!html) {
    return [];
  }

  const ogImages = collectMatches(
    html,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
  );
  const twitterImages = collectMatches(
    html,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
  );
  const appleIcons = collectMatches(
    html,
    /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/gi,
  );

  const all = [...ogImages, ...twitterImages, ...appleIcons]
    .map((value) => resolveUrl(target, value))
    .filter((value) => hasValidUrl(value) && !isFaviconLikeUrl(value));

  return [...new Set(all)];
};

const buildLogoCandidates = (docData, { allowFavicon = false } = {}) => {
  const candidates = [];
  const primary = toText(docData?.logo);
  const external = toText(docData?.logoExternalUrl);
  const website = toText(docData?.url);

  if (hasValidUrl(primary) && (!isFaviconLikeUrl(primary) || allowFavicon)) {
    candidates.push(primary);
  }
  if (
    hasValidUrl(external) &&
    external !== primary &&
    (!isFaviconLikeUrl(external) || allowFavicon)
  ) {
    candidates.push(external);
  }

  const clearbitDomain = domainFromClearbitUrl(primary) || domainFromClearbitUrl(external);
  const websiteDomain = hostnameFromUrl(website);
  const fallbackDomain = clearbitDomain || websiteDomain;

  if (fallbackDomain && allowFavicon) {
    candidates.push(
      `https://www.google.com/s2/favicons?sz=256&domain=${encodeURIComponent(fallbackDomain)}`,
    );
    candidates.push(`https://icons.duckduckgo.com/ip3/${fallbackDomain}.ico`);
  }

  return [...new Set(candidates.filter((item) => hasValidUrl(item)))];
};

const contentTypeToExt = (contentType) => {
  if (!contentType) return "png";
  if (contentType.includes("jpeg")) return "jpg";
  if (contentType.includes("jpg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("png")) return "png";
  return "png";
};

const initializeAdmin = (serviceAccountPath) => {
  if (admin.apps.length > 0) {
    return {
      db: admin.firestore(),
      bucket: admin.storage().bucket(),
    };
  }

  const absolutePath = path.resolve(process.cwd(), serviceAccountPath);
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const serviceAccount = require(absolutePath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`,
  });

  return {
    db: admin.firestore(),
    bucket: admin.storage().bucket(),
  };
};

const isExternalLogoCandidate = (docData, force) => {
  const logo = toText(docData?.logo);
  const storageLogo = toText(docData?.logoStorageUrl);

  if (!hasValidUrl(logo)) {
    return false;
  }
  if (force) {
    return true;
  }
  return !hasValidUrl(storageLogo);
};

const downloadLogo = async (url) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 12000,
    maxRedirects: 3,
    headers: {
      Accept: "image/*,*/*;q=0.8",
      "User-Agent": "DishisionLogoMigrator/1.0",
    },
    validateStatus: (status) => status >= 200 && status < 400,
  });

  const contentType = toText(response.headers?.["content-type"]).toLowerCase();
  if (!contentType.startsWith("image/")) {
    throw new Error(`Unsupported content type: ${contentType || "unknown"}`);
  }

  return {
    buffer: Buffer.from(response.data),
    contentType,
  };
};

const buildStorageDownloadUrl = (bucketName, objectPath, token) => {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
    objectPath,
  )}?alt=media&token=${token}`;
};

const run = async () => {
  const { dryRun, force, allowFavicon, limit, serviceAccountPath } = parseArgs();
  const { db, bucket } = initializeAdmin(serviceAccountPath);

  const snapshot = await db.collection("restaurant").limit(limit).get();

  let scanned = 0;
  let candidates = 0;
  let uploaded = 0;
  let written = 0;
  let skipped = 0;
  let failed = 0;

  let batch = db.batch();
  let pendingWrites = 0;
  const debugRows = [];
  const websiteCandidateCache = new Map();

  for (const docSnap of snapshot.docs) {
    scanned += 1;
    const data = docSnap.data() || {};
    const docId = docSnap.id;

    if (!isExternalLogoCandidate(data, force)) {
      skipped += 1;
      continue;
    }

    candidates += 1;
    const sourceUrl = toText(data.logo);
    const candidateUrls = buildLogoCandidates(data, { allowFavicon });
    const websiteUrl = toText(data?.url);
    const shouldTryWebsiteScrape =
      candidateUrls.length === 0 ||
      candidateUrls.every((item) => item.includes("logo.clearbit.com"));
    if (shouldTryWebsiteScrape && hasValidUrl(websiteUrl)) {
      if (!websiteCandidateCache.has(websiteUrl)) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const scraped = await fetchWebsiteImageCandidates(websiteUrl);
          websiteCandidateCache.set(websiteUrl, scraped);
        } catch (_error) {
          websiteCandidateCache.set(websiteUrl, []);
        }
      }
      const scrapedCandidates = websiteCandidateCache.get(websiteUrl) || [];
      scrapedCandidates.forEach((url) => {
        if (!candidateUrls.includes(url)) {
          candidateUrls.push(url);
        }
      });
    }
    if (candidateUrls.length === 0) {
      failed += 1;
      debugRows.push({
        id: docId,
        status: "error",
        from: sourceUrl,
        message: allowFavicon
          ? "No valid logo URL candidates found"
          : "No full-image logo candidates found (favicon skipped)",
      });
      continue;
    }

    try {
      let selectedUrl = "";
      let downloaded = null;
      for (const candidateUrl of candidateUrls) {
        try {
          // eslint-disable-next-line no-await-in-loop
          downloaded = await downloadLogo(candidateUrl);
          selectedUrl = candidateUrl;
          break;
        } catch (_error) {
          // try next candidate
        }
      }

      if (!downloaded || !selectedUrl) {
        throw new Error("All logo URL candidates failed");
      }

      const { buffer, contentType } = downloaded;
      const safeId = sanitizeId(docId) || "restaurant_logo";
      const ext = contentTypeToExt(contentType);
      const objectPath = `restaurant-logos/${safeId}.${ext}`;
      const token = crypto.randomUUID();

      if (!dryRun) {
        const file = bucket.file(objectPath);
        await file.save(buffer, {
          resumable: false,
          contentType,
          metadata: {
            cacheControl: "public,max-age=31536000,immutable",
            metadata: {
              firebaseStorageDownloadTokens: token,
            },
          },
        });

        const storageUrl = buildStorageDownloadUrl(bucket.name, objectPath, token);
        const patch = {
          logoStorageUrl: storageUrl,
          logoExternalUrl: toText(data.logoExternalUrl || selectedUrl || sourceUrl),
          logoSource: "storage",
          logoVerified: true,
          logoStatus: "available",
          lastLogoMigrationAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        batch.update(docSnap.ref, patch);
        pendingWrites += 1;
        uploaded += 1;

        if (pendingWrites >= BATCH_SIZE) {
          await batch.commit();
          written += pendingWrites;
          batch = db.batch();
          pendingWrites = 0;
        }
      } else {
        uploaded += 1;
      }

      debugRows.push({
        id: docId,
        status: dryRun ? "would_migrate" : "migrated",
        from: selectedUrl,
        toPath: objectPath,
      });
    } catch (error) {
      failed += 1;
      debugRows.push({
        id: docId,
        status: "error",
        from: sourceUrl,
        message: error.message,
      });
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
        candidates,
        uploaded,
        written,
        skipped,
        failed,
        dryRun,
        force,
        allowFavicon,
        inspectedLimit: limit,
      },
      null,
      2,
    ),
  );
  console.log("\nSample results:");
  debugRows.slice(0, 40).forEach((row) => console.log(row));
};

run().catch((error) => {
  console.error("Logo migration failed:", error.message);
  process.exit(1);
});
