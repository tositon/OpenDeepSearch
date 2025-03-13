#!/usr/bin/env node

/**
 * OpenDeepSearch - Main entry point
 * An open-source alternative to Perplexity Deep Research using MCP
 */

import { MCPServer } from './mcp.js';
import { BraveWebSearchTool, BraveLocalSearchTool } from './tools/braveSearch.js';
import { SequentialThinkingTool } from './tools/sequentialThinking.js';
import { DeepResearchTool } from './tools/deepResearch.js';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

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

// Create MCP server
const server = new MCPServer({
  name: 'open-deep-research',
  version: '0.1.0',
  description: 'An open-source alternative to Perplexity Deep Research using MCP'
});

// Register tools
const braveWebSearchTool = new BraveWebSearchTool(apiKey);
const braveLocalSearchTool = new BraveLocalSearchTool(apiKey);
const sequentialThinkingTool = new SequentialThinkingTool();
const deepResearchTool = new DeepResearchTool(apiKey);

server.registerTool(braveWebSearchTool);
server.registerTool(braveLocalSearchTool);
server.registerTool(sequentialThinkingTool);
server.registerTool(deepResearchTool);

// Generate a unique server ID
const serverId = uuidv4();

// Start the server
server.start().then(() => {
  console.log(chalk.green('OpenDeepSearch MCP server started'));
  console.log(chalk.green(`Server ID: ${serverId}`));
  console.log(chalk.green('Registered tools:'));
  console.log(chalk.green('- brave_web_search: Web search using Brave Search API'));
  console.log(chalk.green('- brave_local_search: Local search using Brave Search API'));
  console.log(chalk.green('- sequentialthinking: Sequential thinking for complex problem solving'));
  console.log(chalk.green('- deep_research: Comprehensive research combining Sequential Thinking and Brave Search'));
  console.log('');
  console.log(chalk.yellow('Press Ctrl+C to stop the server'));
}).catch((error: unknown) => {
  console.error(chalk.red('Error starting server:'), error);
  process.exit(1);
}); 