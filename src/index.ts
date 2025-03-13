#!/usr/bin/env node

/**
 * OpenDeepSearch - Main entry point
 * An open-source alternative to Perplexity Deep Research using MCP
 */

// Загрузка переменных из .env файла
import 'dotenv/config';

import { WebSocketMCPServer } from './websocket/server.js';
import chalk from 'chalk';

// Banner
console.log(chalk.blue(`
 ██████╗ ██████╗ ███████╗███╗   ██╗██████╗ ███████╗███████╗██████╗ ███████╗███████╗ █████╗ ██████╗  ██████╗██╗  ██╗
██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██║  ██║
██║   ██║██████╔╝█████╗  ██╔██╗ ██║██║  ██║█████╗  █████╗  ██████╔╝███████╗█████╗  ███████║██████╔╝██║     ███████║
██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══╝  ██╔═══╝ ╚════██║██╔══╝  ██╔══██║██╔══██╗██║     ██╔══██║
╚██████╔╝██║     ███████╗██║ ╚████║██████╔╝███████╗███████╗██║     ███████║███████╗██║  ██║██║  ██║╚██████╗██║  ██║
 ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
`));
console.log(chalk.green('An open-source alternative to Perplexity Deep Research using MCP'));
console.log(chalk.yellow('Version 0.1.0'));
console.log('');

// Check for API key
const apiKey = process.env.BRAVE_API_KEY;
if (!apiKey) {
  console.error(chalk.red('Error: BRAVE_API_KEY environment variable is required'));
  console.log(chalk.yellow('Get a Brave Search API key at https://brave.com/search/api/'));
  console.log(chalk.yellow('Then run with: BRAVE_API_KEY=your_api_key npx open-deep-research'));
  process.exit(1);
}

// Get port from environment or use default
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Create WebSocket MCP server
const server = new WebSocketMCPServer({
  port,
  apiKey
});

// Start the server
server.start().then(() => {
  console.log(chalk.green(`Server is running at http://localhost:${port}`));
  console.log(chalk.yellow('Use Model Context Protocol Inspector to test the server:'));
  console.log(chalk.yellow('npx @modelcontextprotocol/inspector'));
}).catch((error: unknown) => {
  console.error(chalk.red('Error starting server:'), error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\nShutting down server...'));
  try {
    await server.stop();
    console.log(chalk.green('Server stopped gracefully'));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('Error stopping server:'), error);
    process.exit(1);
  }
}); 