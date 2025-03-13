declare module '@modelcontextprotocol/sdk/server/mcp.js' {
  export class McpServer {
    constructor(options: {
      name: string;
      version: string;
      description: string;
    });

    tool(
      name: string, 
      description: string,
      paramsSchema: any,
      handler: (params: any) => Promise<any>
    ): void;

    connect(transport: any): Promise<void>;
  }
} 