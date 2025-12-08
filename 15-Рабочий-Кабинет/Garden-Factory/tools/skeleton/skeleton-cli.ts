/**
 * CLI entry point for Skeleton
 * Handles command-line arguments and output formatting
 */

import Skeleton from './skeleton.js';
import { formatOutput, formatCompact } from './formatter.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node skeleton-cli.js [options] <file-path>');
    console.error('Options:');
    console.error('  --json      Output raw JSON (default: pretty tree)');
    console.error('  --compact   Output one-liner');
    console.error('\nExamples:');
    console.error('  node skeleton-cli.js ./src/main.ts');
    console.error('  node skeleton-cli.js --json ./src/main.ts');
    console.error('  node skeleton-cli.js --compact ./README.md');
    process.exit(1);
  }

  let filePath = args[0];
  let outputFormat = 'tree';

  // Parse options
  if (filePath === '--json') {
    outputFormat = 'json';
    filePath = args[1];
  } else if (filePath === '--compact') {
    outputFormat = 'compact';
    filePath = args[1];
  }

  if (!filePath) {
    console.error('Error: file path is required');
    process.exit(1);
  }

  const skeleton = new Skeleton();

  try {
    const structure = await skeleton.parse(filePath);

    // Output based on format
    switch (outputFormat) {
      case 'json':
        console.log(JSON.stringify(structure, null, 2));
        break;
      case 'compact':
        console.log(formatCompact(structure));
        break;
      case 'tree':
      default:
        console.log(formatOutput(structure));
        break;
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

main();
