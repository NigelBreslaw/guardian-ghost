import * as fs from "fs";
import path from "path";
import { downloadJsonFile, createMiniDefinition } from "./next_gen";

interface VerificationResult {
  passed: boolean;
  differences: {
    missingKeys: string[];
    extraKeys: string[];
    changedValues: Array<{
      key: string;
      path: string;
      baseline: any;
      current: any;
    }>;
    structuralDifferences: Array<{
      key: string;
      path: string;
      baselineType: string;
      currentType: string;
    }>;
  };
}

function deepEqual(obj1: any, obj2: any, path: string = ""): VerificationResult["differences"] {
  const differences: VerificationResult["differences"] = {
    missingKeys: [],
    extraKeys: [],
    changedValues: [],
    structuralDifferences: [],
  };

  if (obj1 === obj2) {
    return differences;
  }

  if (obj1 === null || obj2 === null) {
    if (obj1 !== obj2) {
      differences.changedValues.push({
        key: path || "root",
        path: path || "root",
        baseline: obj1,
        current: obj2,
      });
    }
    return differences;
  }

  if (typeof obj1 !== typeof obj2) {
    differences.structuralDifferences.push({
      key: path || "root",
      path: path || "root",
      baselineType: typeof obj1,
      currentType: typeof obj2,
    });
    return differences;
  }

  if (typeof obj1 !== "object" || Array.isArray(obj1) !== Array.isArray(obj2)) {
    if (obj1 !== obj2) {
      differences.changedValues.push({
        key: path || "root",
        path: path || "root",
        baseline: obj1,
        current: obj2,
      });
    }
    return differences;
  }

  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) {
      differences.changedValues.push({
        key: path || "root",
        path: path || "root",
        baseline: `[Array length: ${obj1.length}]`,
        current: `[Array length: ${obj2.length}]`,
      });
    }
    const maxLength = Math.max(obj1.length, obj2.length);
    for (let i = 0; i < maxLength; i++) {
      const itemPath = `${path}[${i}]`;
      if (i >= obj1.length) {
        differences.extraKeys.push(itemPath);
      } else if (i >= obj2.length) {
        differences.missingKeys.push(itemPath);
      } else {
        const itemDiffs = deepEqual(obj1[i], obj2[i], itemPath);
        differences.missingKeys.push(...itemDiffs.missingKeys);
        differences.extraKeys.push(...itemDiffs.extraKeys);
        differences.changedValues.push(...itemDiffs.changedValues);
        differences.structuralDifferences.push(...itemDiffs.structuralDifferences);
      }
    }
    return differences;
  }

  // Compare objects
  const keys1 = new Set(Object.keys(obj1));
  const keys2 = new Set(Object.keys(obj2));

  for (const key of keys1) {
    if (!keys2.has(key)) {
      differences.missingKeys.push(path ? `${path}.${key}` : key);
    } else {
      const keyPath = path ? `${path}.${key}` : key;
      const keyDiffs = deepEqual(obj1[key], obj2[key], keyPath);
      differences.missingKeys.push(...keyDiffs.missingKeys);
      differences.extraKeys.push(...keyDiffs.extraKeys);
      differences.changedValues.push(...keyDiffs.changedValues);
      differences.structuralDifferences.push(...keyDiffs.structuralDifferences);
    }
  }

  for (const key of keys2) {
    if (!keys1.has(key)) {
      differences.extraKeys.push(path ? `${path}.${key}` : key);
    }
  }

  return differences;
}

function compareOutputs(baseline: any, current: any): VerificationResult {
  // Normalize JSON comparison - parse and stringify to handle property order
  const baselineNormalized = JSON.parse(JSON.stringify(baseline));
  const currentNormalized = JSON.parse(JSON.stringify(current));
  const normalizedDiffs = deepEqual(baselineNormalized, currentNormalized, "");

  return {
    passed: normalizedDiffs.missingKeys.length === 0 &&
            normalizedDiffs.extraKeys.length === 0 &&
            normalizedDiffs.changedValues.length === 0 &&
            normalizedDiffs.structuralDifferences.length === 0,
    differences: normalizedDiffs,
  };
}

async function saveBaselineOutput(key: string, data: any): Promise<void> {
  const baselineDir = path.join(__dirname, "baseline-output");
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true });
  }

  const outputPath = path.join(baselineDir, `${key}.json`);
  const jsonString = JSON.stringify(data, null, 0);
  fs.writeFileSync(outputPath, jsonString, "utf8");
}

function loadBaselineOutput(key: string): any | null {
  const baselinePath = path.join(__dirname, "baseline-output", `${key}.json`);
  if (!fs.existsSync(baselinePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(baselinePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load baseline for ${key}: ${error}`);
    return null;
  }
}

function saveBaselineManifest(keys: string[]): void {
  const baselineDir = path.join(__dirname, "baseline-output");
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true });
  }

  const manifestPath = path.join(baselineDir, "manifest.json");
  const manifest = {
    timestamp: new Date().toISOString(),
    keys: keys.sort(),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
}

function loadBaselineManifest(): string[] | null {
  const manifestPath = path.join(__dirname, "baseline-output", "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(content);
    return manifest.keys || null;
  } catch (error) {
    console.error(`Failed to load baseline manifest: ${error}`);
    return null;
  }
}

async function processDefinition(definitionUrl: string, uniqueKey: string): Promise<any> {
  const jsonData = await downloadJsonFile(definitionUrl);
  const processedData = createMiniDefinition(jsonData, uniqueKey);
  return processedData;
}

async function saveBaseline(): Promise<void> {
  console.log("Saving baseline output...\n");

  const manifestUrl = "https://www.bungie.net/Platform/Destiny2/Manifest/";
  const jsonManifest = await downloadJsonFile(manifestUrl);
  const jsonWorldComponentContentPaths = jsonManifest.Response.jsonWorldComponentContentPaths;
  const keys = Object.keys(jsonWorldComponentContentPaths);
  
  const suffix = "_b";
  const id = `${jsonManifest.Response.jsonWorldComponentContentPaths["en"].DestinyInventoryItemDefinition}${suffix}`;

  console.log(`Processing ${keys.length} definition files...\n`);

  const startTime = Date.now();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const definitionUrl = "https://bungie.com" + jsonWorldComponentContentPaths[key].DestinyInventoryItemDefinition;
    const fileStartTime = Date.now();
    console.log(`[${i + 1}/${keys.length}] Processing ${key}...`);
    
    const processedData = await processDefinition(definitionUrl, id);
    await saveBaselineOutput(key, processedData);
    
    const fileTime = ((Date.now() - fileStartTime) / 1000).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const avgTime = (Date.now() - startTime) / (i + 1) / 1000;
    const remaining = (avgTime * (keys.length - i - 1)).toFixed(0);
    console.log(`  ✓ Completed in ${fileTime}s (Total: ${elapsed}s, Est. remaining: ${remaining}s)\n`);
  }

  saveBaselineManifest(keys);
  console.log(`\n✅ Baseline saved for ${keys.length} definition files`);
}

async function compareAgainstBaseline(): Promise<number> {
  console.log("Comparing output against baseline...\n");

  const manifestUrl = "https://www.bungie.net/Platform/Destiny2/Manifest/";
  const jsonManifest = await downloadJsonFile(manifestUrl);
  const jsonWorldComponentContentPaths = jsonManifest.Response.jsonWorldComponentContentPaths;
  const currentKeys = Object.keys(jsonWorldComponentContentPaths);
  
  const baselineKeys = loadBaselineManifest();
  if (!baselineKeys) {
    console.error("❌ No baseline manifest found. Run with --save-baseline first.");
    return 1;
  }

  const suffix = "_b";
  const id = `${jsonManifest.Response.jsonWorldComponentContentPaths["en"].DestinyInventoryItemDefinition}${suffix}`;

  let totalPassed = 0;
  let totalFailed = 0;
  const failedKeys: string[] = [];

  console.log(`Comparing ${baselineKeys.length} definition files...\n`);

  const startTime = Date.now();
  // Check all keys that exist in baseline
  for (let i = 0; i < baselineKeys.length; i++) {
    const key = baselineKeys[i];
    const fileStartTime = Date.now();
    console.log(`[${i + 1}/${baselineKeys.length}] Checking ${key}...`);

    if (!currentKeys.includes(key)) {
      console.log(`  ⚠️  ${key}: Missing in current output`);
      totalFailed++;
      failedKeys.push(key);
      continue;
    }

    const baselineData = loadBaselineOutput(key);
    if (!baselineData) {
      console.log(`  ⚠️  ${key}: Baseline file not found`);
      totalFailed++;
      failedKeys.push(key);
      continue;
    }

    const definitionUrl = "https://bungie.com" + jsonWorldComponentContentPaths[key].DestinyInventoryItemDefinition;
    const currentData = await processDefinition(definitionUrl, id);
    const result = compareOutputs(baselineData, currentData);
    
    const fileTime = ((Date.now() - fileStartTime) / 1000).toFixed(1);

    if (result.passed) {
      console.log(`  ✅ Match (${fileTime}s)`);
      totalPassed++;
    } else {
      console.log(`  ❌ Differences found (${fileTime}s)`);
      totalFailed++;
      failedKeys.push(key);

      if (result.differences.missingKeys.length > 0) {
        console.log(`     Missing keys: ${result.differences.missingKeys.slice(0, 5).join(", ")}${result.differences.missingKeys.length > 5 ? ` ... (${result.differences.missingKeys.length} total)` : ""}`);
      }
      if (result.differences.extraKeys.length > 0) {
        console.log(`     Extra keys: ${result.differences.extraKeys.slice(0, 5).join(", ")}${result.differences.extraKeys.length > 5 ? ` ... (${result.differences.extraKeys.length} total)` : ""}`);
      }
      if (result.differences.changedValues.length > 0) {
        console.log(`     Changed values: ${result.differences.changedValues.slice(0, 3).map(v => v.path).join(", ")}${result.differences.changedValues.length > 3 ? ` ... (${result.differences.changedValues.length} total)` : ""}`);
      }
      if (result.differences.structuralDifferences.length > 0) {
        console.log(`     Structural differences: ${result.differences.structuralDifferences.slice(0, 3).map(v => v.path).join(", ")}${result.differences.structuralDifferences.length > 3 ? ` ... (${result.differences.structuralDifferences.length} total)` : ""}`);
      }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const avgTime = (Date.now() - startTime) / (i + 1) / 1000;
    const remaining = (avgTime * (baselineKeys.length - i - 1)).toFixed(0);
    console.log(`  Progress: ${elapsed}s elapsed, ~${remaining}s remaining\n`);
  }

  // Check for new keys not in baseline
  const newKeys = currentKeys.filter(k => !baselineKeys.includes(k));
  if (newKeys.length > 0) {
    console.log(`\n⚠️  New keys not in baseline: ${newKeys.join(", ")}`);
  }

  console.log(`\n=== Summary ===`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`Total: ${baselineKeys.length}`);

  if (totalFailed > 0) {
    console.log(`\nFailed keys: ${failedKeys.join(", ")}`);
    return 1;
  }

  return 0;
}

async function main() {
  const args = process.argv.slice(2);
  const isSaveBaseline = args.includes("--save-baseline");
  const isCompare = args.includes("--compare");

  if (isSaveBaseline) {
    await saveBaseline();
  } else if (isCompare) {
    const exitCode = await compareAgainstBaseline();
    process.exit(exitCode);
  } else {
    console.log("Usage:");
    console.log("  --save-baseline  Save current output as baseline");
    console.log("  --compare       Compare current output against baseline");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});

