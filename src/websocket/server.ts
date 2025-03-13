/**
 * WebSocket транспорт для MCP-сервера
 * Реализация на основе официального SDK для MCP
 */

// Используем require вместо import для обхода проблемы с типами
// @ts-ignore
const { McpServer } = require('@modelcontextprotocol/sdk/dist/esm/server/mcp.js');
import { WebSocketServer } from 'ws';
import { BraveWebSearchTool, BraveLocalSearchTool } from '../tools/braveSearch.js';
import { SequentialThinkingTool } from '../tools/sequentialThinking.js';
import { DeepResearchTool } from '../tools/deepResearch.js';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

/**
 * Опции для WebSocket MCP-сервера
 */
export interface WebSocketMCPServerOptions {
  port?: number;
  apiKey: string;
}

/**
 * Класс для реализации WebSocket транспорта
 */
class WebSocketServerTransport {
  private wss: WebSocketServer;
  private connections: Set<any> = new Set();
  
  constructor(options: { port: number }) {
    this.wss = new WebSocketServer({ port: options.port });
    
    this.wss.on('connection', (ws) => {
      this.connections.add(ws);
      
      ws.on('message', (message) => {
        // Обработка сообщений от клиента
        try {
          const data = JSON.parse(message.toString());
          // Здесь будет обработка сообщений MCP
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });
      
      ws.on('close', () => {
        this.connections.delete(ws);
      });
    });
  }
  
  // Метод для отправки сообщений клиентам
  send(message: any): void {
    const messageStr = JSON.stringify(message);
    this.connections.forEach((ws) => {
      if (ws.readyState === 1) { // OPEN
        ws.send(messageStr);
      }
    });
  }
  
  // Метод для закрытия соединений
  close(): void {
    this.wss.close();
  }
}

/**
 * WebSocket MCP-сервер
 */
export class WebSocketMCPServer {
  private server: any; // Используем any для обхода проблемы с типами
  private transport: WebSocketServerTransport;
  private serverId: string;
  private options: WebSocketMCPServerOptions;

  constructor(options: WebSocketMCPServerOptions) {
    this.options = options;
    this.serverId = uuidv4();

    // Проверка API ключа
    if (!options.apiKey) {
      throw new Error('API key is required');
    }

    // Создание WebSocket транспорта
    this.transport = new WebSocketServerTransport({
      port: options.port || 3000
    });

    // Создание MCP сервера
    this.server = new McpServer({
      name: 'open-deep-research',
      version: '0.1.0',
      description: 'An open-source alternative to Perplexity Deep Research using MCP'
    });

    // Регистрация инструментов
    const braveWebSearchTool = new BraveWebSearchTool(options.apiKey);
    const braveLocalSearchTool = new BraveLocalSearchTool(options.apiKey);
    const sequentialThinkingTool = new SequentialThinkingTool();
    const deepResearchTool = new DeepResearchTool(options.apiKey);

    // Регистрация инструментов с использованием API официального SDK
    this.server.addTool(braveWebSearchTool.getDefinition().name, {
      schema: braveWebSearchTool.getDefinition().parameters,
      handler: async (params: any) => {
        const result = await braveWebSearchTool.execute(params);
        return result;
      }
    });
    
    this.server.addTool(braveLocalSearchTool.getDefinition().name, {
      schema: braveLocalSearchTool.getDefinition().parameters,
      handler: async (params: any) => {
        const result = await braveLocalSearchTool.execute(params);
        return result;
      }
    });
    
    this.server.addTool(sequentialThinkingTool.getDefinition().name, {
      schema: sequentialThinkingTool.getDefinition().parameters,
      handler: async (params: any) => {
        const result = await sequentialThinkingTool.execute(params);
        return result;
      }
    });
    
    this.server.addTool(deepResearchTool.getDefinition().name, {
      schema: deepResearchTool.getDefinition().parameters,
      handler: async (params: any) => {
        const result = await deepResearchTool.execute(params);
        return result;
      }
    });
  }

  /**
   * Запуск WebSocket MCP-сервера
   */
  async start(): Promise<void> {
    try {
      // В реальной реализации здесь будет интеграция с транспортом
      // Для упрощенной версии просто выводим информацию о запуске
      
      console.log(chalk.green('OpenDeepSearch MCP server started'));
      console.log(chalk.green(`Server ID: ${this.serverId}`));
      console.log(chalk.green(`WebSocket server running on port: ${this.options.port || 3000}`));
      console.log(chalk.green('Registered tools:'));
      console.log(chalk.green('- brave_web_search: Web search using Brave Search API'));
      console.log(chalk.green('- brave_local_search: Local search using Brave Search API'));
      console.log(chalk.green('- sequentialthinking: Sequential thinking for complex problem solving'));
      console.log(chalk.green('- deep_research: Comprehensive research combining Sequential Thinking and Brave Search'));
      console.log('');
      console.log(chalk.yellow('Press Ctrl+C to stop the server'));
    } catch (error) {
      console.error(chalk.red('Error starting server:'), error);
      throw error;
    }
  }

  /**
   * Остановка WebSocket MCP-сервера
   */
  async stop(): Promise<void> {
    try {
      // Закрытие WebSocket соединений
      this.transport.close();
      console.log(chalk.green('OpenDeepSearch MCP server stopped'));
    } catch (error) {
      console.error(chalk.red('Error stopping server:'), error);
      throw error;
    }
  }
} 