/**
 * WebSocket транспорт для MCP-сервера
 * Реализация на основе официального SDK для MCP
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from "@modelcontextprotocol/sdk/types.js";
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
 * Интерфейс для WebSocket соединений
 */
interface WebSocketConnection {
  ws: WebSocket;
  id: string;
}

// Определение интерфейсов согласно MCP SDK
interface TransportResponse {
  message: any;
}

interface TransportRequest {
  connectionId: string;
  message: any;
  respond: (response: TransportResponse) => Promise<void>;
}

interface ServerTransport {
  start(): Promise<void>;
  stop(): Promise<void>;
  onRequest(handler: (request: TransportRequest) => Promise<void>): void;
}

/**
 * WebSocket транспорт для MCP, соответствующий интерфейсу ServerTransport из SDK
 */
export class WebSocketServerTransport implements ServerTransport {
  private wss: WebSocketServer;
  private connections: Map<string, WebSocketConnection> = new Map();
  private requestHandlers: Array<(request: TransportRequest) => Promise<void>> = [];
  private port: number;

  constructor(options: { port: number }) {
    this.port = options.port;
    this.wss = new WebSocketServer({ port: options.port });
  }

  /**
   * Запуск транспорта
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.wss.on('connection', (ws) => {
        const connectionId = uuidv4();
        this.connections.set(connectionId, { ws, id: connectionId });
        console.log(chalk.blue(`Client connected: ${connectionId}`));

        // Обработка входящих сообщений
        ws.on('message', async (rawMessage) => {
          try {
            const message = JSON.parse(rawMessage.toString());
            console.log(chalk.gray(`Received message from ${connectionId}:`, JSON.stringify(message).substring(0, 200) + '...'));

            // Создание объекта запроса TransportRequest согласно MCP спецификации
            const request: TransportRequest = {
              connectionId,
              message,
              respond: async (response: TransportResponse) => {
                this.sendResponse(connectionId, response);
              }
            };

            // Уведомляем все обработчики о новом запросе
            for (const handler of this.requestHandlers) {
              await handler(request);
            }
          } catch (error) {
            console.error(chalk.red(`Error processing message from ${connectionId}:`), error);
          }
        });

        // Обработка закрытия соединения
        ws.on('close', () => {
          console.log(chalk.blue(`Client disconnected: ${connectionId}`));
          this.connections.delete(connectionId);
        });

        // WebSocket соединение установлено - отправляем клиенту объявление сервера
        // Это будет обработано через обработчики запросов
      });

      console.log(chalk.green(`WebSocket server started on port ${this.port}`));
      resolve();
    });
  }

  /**
   * Отправка ответа клиенту
   */
  private sendResponse(connectionId: string, response: TransportResponse): void {
    const connection = this.connections.get(connectionId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(response.message));
    } else {
      console.warn(chalk.yellow(`Cannot send response to client ${connectionId}: not connected`));
    }
  }

  /**
   * Регистрация обработчика запросов (требуется для интерфейса ServerTransport)
   */
  onRequest(handler: (request: TransportRequest) => Promise<void>): void {
    this.requestHandlers.push(handler);
  }

  /**
   * Остановка транспорта
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wss.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

/**
 * WebSocket MCP-сервер
 */
export class WebSocketMCPServer {
  private server: Server;
  private transport: WebSocketServerTransport;
  private options: WebSocketMCPServerOptions;
  private port: number;
  private tools: Tool[] = [];

  constructor(options: WebSocketMCPServerOptions) {
    this.options = options;
    this.port = options.port || 3000;

    // Проверка API ключа
    if (!options.apiKey) {
      throw new Error('API key is required');
    }

    // Создание WebSocket транспорта
    this.transport = new WebSocketServerTransport({
      port: this.port
    });

    // Создание MCP-сервера
    this.server = new Server(
      {
        name: 'open-deep-research',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
  }

  /**
   * Запуск WebSocket MCP-сервера
   */
  async start(): Promise<void> {
    try {
      // Подготовка инструментов
      await this.prepareTools();

      // Регистрация обработчиков запросов согласно спецификации MCP
      this.setRequestHandlers();

      // Подключение транспорта к серверу
      // @ts-ignore - обходим проверку типов, так как методы могут отличаться в разных версиях SDK
      await this.server.connect(this.transport);

      // Запуск транспорта
      await this.transport.start();

      // Вывод информации о запуске
      console.log(chalk.green('OpenDeepSearch MCP server started'));
      console.log(chalk.green(`WebSocket server running on port: ${this.port}`));
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
   * Регистрация обработчиков запросов для инструментов
   */
  private setRequestHandlers(): void {
    try {
      // Обработчик списка инструментов
      this.server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          tools: this.tools,
        };
      });

      // Обработчик вызова инструментов
      this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        try {
          const { name, arguments: args } = request.params;

          if (!args) {
            throw new Error("No arguments provided");
          }

          // Вызов соответствующего инструмента
          switch (name) {
            case "brave_web_search": {
              return await this.callBraveWebSearch(args);
            }
            case "brave_local_search": {
              return await this.callBraveLocalSearch(args);
            }
            case "sequentialthinking": {
              return await this.callSequentialThinking(args);
            }
            case "deep_research": {
              return await this.callDeepResearch(args);
            }
            default: {
              return {
                content: [{ type: "text", text: `Unknown tool: ${name}` }],
                isError: true,
              };
            }
          }
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: error instanceof Error ? error.message : String(error) 
            }],
            isError: true,
          };
        }
      });

      console.log(chalk.green('Request handlers registered successfully'));
    } catch (error) {
      console.error(chalk.red('Error setting up request handlers:'), error);
      throw error;
    }
  }

  /**
   * Подготовка инструментов
   */
  private async prepareTools(): Promise<void> {
    try {
      // Импортируем инструменты
      const { BraveWebSearchTool, BraveLocalSearchTool } = await import('../tools/braveSearch.js');
      const { SequentialThinkingTool } = await import('../tools/sequentialThinking.js');
      const { DeepResearchTool } = await import('../tools/deepResearch.js');

      // Создание экземпляров инструментов
      const braveWebSearchTool = new BraveWebSearchTool(this.options.apiKey);
      const braveLocalSearchTool = new BraveLocalSearchTool(this.options.apiKey);
      const sequentialThinkingTool = new SequentialThinkingTool();
      const deepResearchTool = new DeepResearchTool(this.options.apiKey);

      // Преобразование определений инструментов в формат Tool согласно MCP SDK
      // Создаем инструменты вручную с соблюдением ожидаемых форматов
      const webSearchTool: Tool = {
        name: braveWebSearchTool.getDefinition().name,
        description: braveWebSearchTool.getDefinition().description,
        inputSchema: {
          type: "object",
          properties: braveWebSearchTool.getDefinition().parameters.properties
        }
      };

      const localSearchTool: Tool = {
        name: braveLocalSearchTool.getDefinition().name,
        description: braveLocalSearchTool.getDefinition().description,
        inputSchema: {
          type: "object",
          properties: braveLocalSearchTool.getDefinition().parameters.properties
        }
      };

      const sequentialThinkingToolDef: Tool = {
        name: sequentialThinkingTool.getDefinition().name,
        description: sequentialThinkingTool.getDefinition().description,
        inputSchema: {
          type: "object",
          properties: sequentialThinkingTool.getDefinition().parameters.properties
        }
      };

      const deepResearchToolDef: Tool = {
        name: deepResearchTool.getDefinition().name,
        description: deepResearchTool.getDefinition().description,
        inputSchema: {
          type: "object",
          properties: deepResearchTool.getDefinition().parameters.properties
        }
      };

      // Добавляем инструменты в список доступных
      this.tools.push(webSearchTool);
      this.tools.push(localSearchTool);
      this.tools.push(sequentialThinkingToolDef);
      this.tools.push(deepResearchToolDef);

      console.log(chalk.green('All tools prepared successfully'));
    } catch (error) {
      console.error(chalk.red('Error preparing tools:'), error);
      throw error;
    }
  }

  /**
   * Вызов инструмента Brave Web Search
   */
  private async callBraveWebSearch(args: any): Promise<any> {
    const { BraveWebSearchTool } = await import('../tools/braveSearch.js');
    const tool = new BraveWebSearchTool(this.options.apiKey);
    return await tool.execute(args);
  }

  /**
   * Вызов инструмента Brave Local Search
   */
  private async callBraveLocalSearch(args: any): Promise<any> {
    const { BraveLocalSearchTool } = await import('../tools/braveSearch.js');
    const tool = new BraveLocalSearchTool(this.options.apiKey);
    return await tool.execute(args);
  }

  /**
   * Вызов инструмента Sequential Thinking
   */
  private async callSequentialThinking(args: any): Promise<any> {
    const { SequentialThinkingTool } = await import('../tools/sequentialThinking.js');
    const tool = new SequentialThinkingTool();
    return await tool.execute(args);
  }

  /**
   * Вызов инструмента Deep Research
   */
  private async callDeepResearch(args: any): Promise<any> {
    const { DeepResearchTool } = await import('../tools/deepResearch.js');
    const tool = new DeepResearchTool(this.options.apiKey);
    return await tool.execute(args);
  }

  /**
   * Остановка WebSocket MCP-сервера
   */
  async stop(): Promise<void> {
    try {
      await this.transport.stop();
      console.log(chalk.green('OpenDeepSearch MCP server stopped'));
    } catch (error) {
      console.error(chalk.red('Error stopping server:'), error);
      throw error;
    }
  }
} 