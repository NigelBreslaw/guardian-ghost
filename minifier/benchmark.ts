import * as fs from "fs";
import path from "path";
import { downloadJsonFile, createMiniDefinition, saveToJsonFile } from "./next_gen";

interface BenchmarkResults {
  timestamp: string;
  results: {
    downloadTime: number;
    parseTime: number;
    saveTime: number;
    totalTime: number;
    memoryUsage: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    itemCount: number;
    keys: string[];
  };
}

interface BenchmarkBaseline {
  timestamp: string;
  results: BenchmarkResults["results"];
}

function getMemoryUsage(): BenchmarkResults["results"]["memoryUsage"] {
  if (typeof process !== "undefined" && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external || 0,
      rss: usage.rss,
    };
  }
  return {
    heapUsed: 0,
    heapTotal: 0,
    external: 0,
    rss: 0,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function runBenchmark(): Promise<BenchmarkResults> {
  console.log("Starting benchmark...\n");

  // Get a sample definition URL from the manifest
  const manifestUrl = "https://www.bungie.net/Platform/Destiny2/Manifest/";
  console.log("Downloading manifest...");
  const jsonManifest = await downloadJsonFile(manifestUrl);

  const jsonWorldComponentContentPaths = jsonManifest.Response.jsonWorldComponentContentPaths;
  const keys = Object.keys(jsonWorldComponentContentPaths);
  
  console.log(`Found ${keys.length} definition files\n`);

  // Use the first definition file for benchmarking (or 'en' if available)
  const testKey = keys.includes("en") ? "en" : keys[0];
  const definitionUrl = "https://bungie.com" + jsonWorldComponentContentPaths[testKey].DestinyInventoryItemDefinition;
  
  console.log(`Using definition: ${testKey}`);
  console.log(`URL: ${definitionUrl}\n`);

  const suffix = "_b";
  const uniqueKey = `${jsonWorldComponentContentPaths[testKey].DestinyInventoryItemDefinition}${suffix}`;

  // Measure download time
  const downloadStart = performance.now();
  const jsonData = await downloadJsonFile(definitionUrl);
  const downloadTime = performance.now() - downloadStart;

  // Measure parse time
  const parseStart = performance.now();
  const processedData = createMiniDefinition(jsonData, uniqueKey);
  const parseTime = performance.now() - parseStart;

  // Measure save time
  const outputFilePath = path.join(__dirname, `json/benchmark-${testKey}.json`);
  const saveStart = performance.now();
  await saveToJsonFile(processedData, outputFilePath);
  const saveTime = performance.now() - saveStart;
  const finalMemory = getMemoryUsage();

  const totalTime = downloadTime + parseTime + saveTime;
  const itemCount = Object.keys(processedData.items).length;

  const results: BenchmarkResults = {
    timestamp: new Date().toISOString(),
    results: {
      downloadTime,
      parseTime,
      saveTime,
      totalTime,
      memoryUsage: finalMemory, // Use final memory usage
      itemCount,
      keys: [testKey],
    },
  };

  return results;
}

function saveBaseline(results: BenchmarkResults): void {
  const baselinePath = path.join(__dirname, "benchmark-results.json");
  const baseline: BenchmarkBaseline = {
    timestamp: results.timestamp,
    results: results.results,
  };

  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2), "utf8");
  console.log(`\nBaseline saved to ${baselinePath}`);
}

function loadBaseline(): BenchmarkBaseline | null {
  const baselinePath = path.join(__dirname, "benchmark-results.json");
  if (!fs.existsSync(baselinePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(baselinePath, "utf8");
    return JSON.parse(content) as BenchmarkBaseline;
  } catch (error) {
    console.error(`Failed to load baseline: ${error}`);
    return null;
  }
}

function compareResults(current: BenchmarkResults, baseline: BenchmarkBaseline): void {
  console.log("\n=== Benchmark Comparison ===\n");

  const c = current.results;
  const b = baseline.results;

  console.log("Metric                    | Current      | Baseline     | Change");
  console.log("--------------------------|---------------|--------------|------------");

  const formatTime = (ms: number) => `${ms.toFixed(2)} ms`;
  const formatPercent = (current: number, baseline: number) => {
    const change = ((current - baseline) / baseline) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  console.log(`Download Time             | ${formatTime(c.downloadTime).padEnd(13)} | ${formatTime(b.downloadTime).padEnd(12)} | ${formatPercent(c.downloadTime, b.downloadTime)}`);
  console.log(`Parse Time                | ${formatTime(c.parseTime).padEnd(13)} | ${formatTime(b.parseTime).padEnd(12)} | ${formatPercent(c.parseTime, b.parseTime)}`);
  console.log(`Save Time                 | ${formatTime(c.saveTime).padEnd(13)} | ${formatTime(b.saveTime).padEnd(12)} | ${formatPercent(c.saveTime, b.saveTime)}`);
  console.log(`Total Time                | ${formatTime(c.totalTime).padEnd(13)} | ${formatTime(b.totalTime).padEnd(12)} | ${formatPercent(c.totalTime, b.totalTime)}`);
  console.log(`Item Count                | ${c.itemCount.toString().padEnd(13)} | ${b.itemCount.toString().padEnd(12)} | ${formatPercent(c.itemCount, b.itemCount)}`);
  console.log(`Memory (Heap Used)        | ${formatBytes(c.memoryUsage.heapUsed).padEnd(13)} | ${formatBytes(b.memoryUsage.heapUsed).padEnd(12)} | ${formatPercent(c.memoryUsage.heapUsed, b.memoryUsage.heapUsed)}`);
  console.log(`Memory (RSS)              | ${formatBytes(c.memoryUsage.rss).padEnd(13)} | ${formatBytes(b.memoryUsage.rss).padEnd(12)} | ${formatPercent(c.memoryUsage.rss, b.memoryUsage.rss)}`);

  console.log("\n=== Summary ===");
  const totalTimeChange = ((c.totalTime - b.totalTime) / b.totalTime) * 100;
  if (totalTimeChange < 0) {
    console.log(`✅ Total time improved by ${Math.abs(totalTimeChange).toFixed(2)}%`);
  } else if (totalTimeChange > 0) {
    console.log(`⚠️  Total time increased by ${totalTimeChange.toFixed(2)}%`);
  } else {
    console.log(`➡️  Total time unchanged`);
  }
}

function printResults(results: BenchmarkResults): void {
  console.log("\n=== Benchmark Results ===\n");
  console.log(`Timestamp: ${results.timestamp}`);
  console.log(`Download Time: ${results.results.downloadTime.toFixed(2)} ms`);
  console.log(`Parse Time: ${results.results.parseTime.toFixed(2)} ms`);
  console.log(`Save Time: ${results.results.saveTime.toFixed(2)} ms`);
  console.log(`Total Time: ${results.results.totalTime.toFixed(2)} ms`);
  console.log(`Item Count: ${results.results.itemCount}`);
  console.log(`Memory (Heap Used): ${formatBytes(results.results.memoryUsage.heapUsed)}`);
  console.log(`Memory (Heap Total): ${formatBytes(results.results.memoryUsage.heapTotal)}`);
  console.log(`Memory (RSS): ${formatBytes(results.results.memoryUsage.rss)}`);
  console.log(`Keys: ${results.results.keys.join(", ")}`);
}

async function main() {
  const args = process.argv.slice(2);
  const isBaseline = args.includes("--baseline");
  const isCompare = args.includes("--compare");

  // Ensure json directory exists
  const jsonPath = path.join(__dirname, `json`);
  if (!fs.existsSync(jsonPath)) {
    fs.mkdirSync(jsonPath, { recursive: true });
  }

  const results = await runBenchmark();

  if (isBaseline) {
    saveBaseline(results);
    printResults(results);
  } else if (isCompare) {
    const baseline = loadBaseline();
    if (!baseline) {
      console.error("No baseline found. Run with --baseline first.");
      process.exit(1);
    }
    printResults(results);
    compareResults(results, baseline);
  } else {
    printResults(results);
    const baseline = loadBaseline();
    if (baseline) {
      console.log("\n(Use --compare to compare against baseline)");
    } else {
      console.log("\n(Use --baseline to save as baseline)");
    }
  }
}

main().catch((error) => {
  console.error("Benchmark failed:", error);
  process.exit(1);
});

