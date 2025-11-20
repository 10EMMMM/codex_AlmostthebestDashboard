const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envConfig = dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (envConfig.error) {
  console.warn('Note: Could not load .env.local file. Ensure it exists if you rely on it for credentials.');
}

// Resolve the path to the Supabase MCP server executable
// We use the dist/index.js which we verified exists
const serverPath = path.resolve(process.cwd(), 'node_modules', '@supabase', 'mcp-server-supabase', 'dist', 'index.js');

console.error('Starting Supabase MCP Server...'); // Use stderr for logs so stdout is kept clear for MCP protocol

const child = spawn('node', [serverPath], {
  stdio: 'inherit', // Important: MCP uses stdin/stdout for communication
  env: {
    ...process.env,
    ...envConfig.parsed,
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.parsed.SUPABASE_URL || envConfig.parsed.NEXT_PUBLIC_SUPABASE_URL
  }
});

child.on('error', (err) => {
  console.error('Failed to start Supabase MCP server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});
