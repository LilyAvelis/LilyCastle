#!/usr/bin/env node
/**
 * Garden-Factory CLI
 * Удобный интерфейс для вызова инструментов из терминала
 * 
 * Использование:
 *   node cli.js buffer size
 *   node cli.js buffer push "Hello world"
 *   node cli.js buffer peek
 *   node cli.js memo write "My note" "tag1,tag2"
 *   node cli.js memo read 5
 */

import { MCPServer } from './dist/engine/server.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function printSuccess(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function printError(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function printInfo(message) {
    console.log(`${colors.cyan}ℹ${colors.reset} ${message}`);
}

function formatJSON(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    
    if (typeof obj !== 'object' || obj === null) {
        return colorize(JSON.stringify(obj), 'yellow');
    }
    
    if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        const items = obj.map(item => `${spaces}  ${formatJSON(item, indent + 1)}`).join('\n');
        return `[\n${items}\n${spaces}]`;
    }
    
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';
    
    const lines = entries.map(([key, value]) => {
        const formattedKey = colorize(key, 'cyan');
        const formattedValue = formatJSON(value, indent + 1);
        return `${spaces}  ${formattedKey}: ${formattedValue}`;
    });
    
    return `{\n${lines.join('\n')}\n${spaces}}`;
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(colorize('Garden-Factory CLI', 'bright'));
        console.log('');
        console.log('Usage:');
        console.log('  node cli.js buffer <action> [args...]');
        console.log('  node cli.js memo <action> [args...]');
        console.log('  node cli.js skeleton <file> [--json|--compact]');
        console.log('  node cli.js models [filter]');
        console.log('  node cli.js status');
        console.log('');
        console.log('Buffer actions:');
        console.log('  size                    - Get buffer size');
        console.log('  peek                    - View last entry');
        console.log('  pop                     - Get and remove last entry');
        console.log('  push <msg> [type] [src] - Add entry');
        console.log('  history [limit]         - Show history');
        console.log('  clear                   - Clear buffer');
        console.log('');
        console.log('Memo actions:');
        console.log('  size                    - Get memo size');
        console.log('  read [limit]            - Read entries');
        console.log('  write <content> [tags]  - Write entry');
        console.log('  search <tag>            - Search by tag');
        console.log('  clear                   - Clear memo');
        console.log('');
        console.log('Skeleton actions:');
        console.log('  skeleton <file>         - Parse file structure (default: tree view)');
        console.log('  skeleton <file> --json  - Output as JSON');
        console.log('  skeleton <file> --compact - Output summary');
        console.log('');
        console.log('Examples:');
        console.log('  node cli.js buffer push "Hello from CLI" test sofia');
        console.log('  node cli.js buffer peek');
        console.log('  node cli.js memo write "Important note" "ai,memory"');
        console.log('  node cli.js memo read 10');
        console.log('  node cli.js skeleton ./src/main.ts');
        console.log('  node cli.js skeleton ./README.md --compact');
        process.exit(0);
    }
    
    const [category, action, ...params] = args;
    
    // Handle skeleton separately (not via MCP)
    if (category === 'skeleton') {
        // Dynamically import skeleton
        const { default: Skeleton } = await import('./dist/tools/skeleton/skeleton.js');
        const { formatOutput, formatCompact } = await import('./dist/tools/skeleton/formatter.js');
        
        let filePath = action;
        let outputFormat = 'tree';
        
        // Check for format options in params
        if (params.includes('--json')) {
            outputFormat = 'json';
        } else if (params.includes('--compact')) {
            outputFormat = 'compact';
        }
        
        if (!filePath || filePath.startsWith('--')) {
            console.log(colorize('Skeleton CLI', 'bright'));
            console.log('');
            console.log('Usage:');
            console.log('  node cli.js skeleton <file-path> [--json|--compact]');
            console.log('');
            console.log('Options:');
            console.log('  --json      Output raw JSON');
            console.log('  --compact   Output one-liner');
            console.log('');
            console.log('Examples:');
            console.log('  node cli.js skeleton ./src/main.ts');
            console.log('  node cli.js skeleton ./README.md --compact');
            console.log('  node cli.js skeleton ./package.json --json');
            process.exit(0);
        }
        
        try {
            const skeleton = new Skeleton();
            const structure = await skeleton.parse(filePath);
            
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
            process.exit(0);
        } catch (error) {
            printError(`Ошибка: ${error.message}`);
            process.exit(1);
        }
    }
    
    try {
        const toolsPath = join(__dirname, 'dist', 'tools');
        const server = new MCPServer(toolsPath);
        await server.loadTools();
        
        let result;
        
        if (category === 'buffer') {
            switch (action) {
                case 'size':
                    result = await server.runTool('buffer_action', 'size');
                    break;
                case 'peek':
                    result = await server.runTool('buffer_action', 'peek');
                    break;
                case 'pop':
                    result = await server.runTool('buffer_action', 'pop');
                    break;
                case 'push':
                    const [content, type = 'text', source = 'cli'] = params;
                    if (!content) {
                        printError('Content is required for push');
                        process.exit(1);
                    }
                    result = await server.runTool('buffer_action', 'push', content, type, source);
                    break;
                case 'history':
                    const limit = params[0] || '10';
                    result = await server.runTool('buffer_action', 'history', undefined, undefined, undefined, limit);
                    break;
                case 'clear':
                    result = await server.runTool('buffer_action', 'clear');
                    break;
                default:
                    printError(`Unknown buffer action: ${action}`);
                    process.exit(1);
            }
        } else if (category === 'memo') {
            switch (action) {
                case 'size':
                    result = await server.runTool('memo_action', 'size');
                    break;
                case 'read':
                    const readLimit = params[0] || '10';
                    result = await server.runTool('memo_action', 'read', undefined, undefined, readLimit);
                    break;
                case 'write':
                    const [memoContent, tags = ''] = params;
                    if (!memoContent) {
                        printError('Content is required for write');
                        process.exit(1);
                    }
                    result = await server.runTool('memo_action', 'write', memoContent, tags);
                    break;
                case 'search':
                    const searchTag = params[0];
                    if (!searchTag) {
                        printError('Tag is required for search');
                        process.exit(1);
                    }
                    result = await server.runTool('memo_action', 'search', undefined, searchTag);
                    break;
                case 'clear':
                    result = await server.runTool('memo_action', 'clear');
                    break;
                default:
                    printError(`Unknown memo action: ${action}`);
                    process.exit(1);
            }
        } else if (category === 'models') {
            const filter = action || undefined;
            result = await server.runTool('list_models', filter);
        } else if (category === 'status') {
            result = await server.runTool('get_key_status');
        } else {
            printError(`Unknown category: ${category}`);
            process.exit(1);
        }
        
        // Parse and format result
        const parsed = typeof result === 'string' ? JSON.parse(result) : result;
        
        if (parsed.status === 'ok' || parsed.status === 'OK') {
            printSuccess(`${category} ${action} - успешно`);
            console.log('');
            console.log(formatJSON(parsed));
        } else if (parsed.status === 'error') {
            printError(`Ошибка: ${parsed.message}`);
            process.exit(1);
        } else {
            // Для команд которые возвращают массив или другой формат
            console.log(formatJSON(parsed));
        }
        
        process.exit(0);
    } catch (error) {
        printError(`Ошибка выполнения: ${error.message}`);
        if (process.env.DEBUG) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

main();
