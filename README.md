# OpenDeepSearch

An open-source alternative to Perplexity Deep Research using the Model Context Protocol (MCP).

## Overview

OpenDeepSearch is a powerful research tool that performs comprehensive, in-depth research on complex topics. It combines the structured thinking approach of Sequential Thinking with the search capabilities of Brave Search to provide detailed, well-sourced research reports.

## Features

- **Comprehensive Research**: Breaks down complex questions into manageable sub-questions
- **Iterative Search**: Performs multiple searches to gather diverse information
- **Intelligent Analysis**: Analyzes search results to extract relevant information
- **Synthesis**: Combines findings into a coherent, well-structured report
- **Citations**: Includes sources for all information in the report
- **MCP Integration**: Seamlessly integrates with Claude Desktop, Cursor, and other MCP clients
- **WebSockets**: Supports integration with Smithery and other MCP clients
- **Publication**: Allows publishing the research tool on the Smithery platform for easy access

## Installation

### Prerequisites

- Node.js 16 or higher
- A Brave Search API key (get one at [https://brave.com/search/api/](https://brave.com/search/api/))

### NPM Installation

```bash
npm install -g open-deep-research
```

### Running with NPX

```bash
BRAVE_API_KEY=your_api_key npx open-deep-research
```

### Local Installation

```bash
# Clone the repository
git clone https://github.com/tositon/open-deep-research.git
cd open-deep-research

# Install dependencies
npm install

# Build the project
npm run build

# Run with Brave Search API
BRAVE_API_KEY=your_api_key npm start
```

### Installation via Smithery

```bash
# Install for Claude
npx @smithery/cli install open-deep-research --client claude

# Install for Cursor
npx @smithery/cli install open-deep-research --client cursor
```

When installing via Smithery, you will be prompted to enter a Brave Search API key.

## Usage

### With Claude Desktop

Add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "open-deep-research": {
      "command": "npx",
      "args": [
        "-y",
        "open-deep-research"
      ],
      "env": {
        "BRAVE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### With Cursor

In Cursor, you can add the MCP server with:

```
claude mcp add "open-deep-research" npx open-deep-research
```

Make sure to set the `BRAVE_API_KEY` environment variable before running Cursor.

### Example Queries

- "What are the latest developments in quantum computing?"
- "Compare and contrast different approaches to climate change mitigation"
- "Explain the history and impact of the Renaissance on European art"
- "What are the pros and cons of different renewable energy sources?"

## How It Works

1. **Question Analysis**: The system analyzes the main question and breaks it down into sub-questions
2. **Iterative Search**: For each sub-question, the system performs searches using Brave Search API
3. **Result Analysis**: The system analyzes the search results to extract relevant information
4. **Synthesis**: The system combines the findings into a coherent report
5. **Citation**: All information is properly cited with sources

## Development

### Setup

```bash
git clone https://github.com/tositon/open-deep-research.git
cd open-deep-research
npm install
```

### Build

```bash
npm run build
```

### Run in Development Mode

```bash
BRAVE_API_KEY=your_api_key npm run dev
```

## Testing

### Testing with MCP Inspector

Для тестирования MCP сервера можно использовать MCP Inspector, который предоставляет удобный интерфейс для взаимодействия с инструментами:

```bash
# Установка и запуск MCP Inspector
npx @modelcontextprotocol/inspector

# Запуск сервера в другом терминале
BRAVE_API_KEY=your_api_key npm start
```

После запуска Inspector, откройте браузер и перейдите по адресу http://localhost:5173. Подключитесь к WebSocket серверу, используя URL `ws://localhost:3000`.

### Примеры запросов для тестирования инструментов

В интерфейсе MCP Inspector вы можете выбрать инструмент и настроить параметры запроса:

#### Тестирование Brave Web Search

```json
{
  "query": "latest quantum computing advancements",
  "count": 5
}
```

#### Тестирование Sequential Thinking

```json
{
  "thought": "Начинаю анализ проблемы глобального потепления",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "nextThoughtNeeded": true
}
```

#### Тестирование Deep Research

```json
{
  "query": "Сравнение различных источников возобновляемой энергии",
  "action": "start",
  "maxSubQuestions": 3
}
```

### Testing with Claude or Cursor

После установки сервера через Smithery или локально, вы можете использовать его с Claude Desktop или Cursor, выбрав соответствующий MCP сервер в настройках.

## Publishing on Smithery

To publish the server on the Smithery platform:

1. Ensure the repository is hosted on GitHub and is public
2. Register on the [Smithery](https://smithery.ai/) platform
3. Authenticate via GitHub to connect with the repository
4. Go to the "Deployments" tab on the server page
5. Click the "Deploy on Smithery" button
6. Follow the deployment setup instructions

After publishing, users can install the server using the Smithery CLI:

```bash
npx @smithery/cli install open-deep-research --client claude
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Perplexity Deep Research
- Built on the Model Context Protocol
- Uses Sequential Thinking approach for structured research
- Powered by Brave Search API 