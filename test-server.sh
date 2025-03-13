#!/bin/bash
# Скрипт для тестирования OpenDeepSearch сервера

# Проверка наличия Brave API ключа
if [ -z "$BRAVE_API_KEY" ]; then
  echo "Error: BRAVE_API_KEY environment variable is required."
  echo "Please set it by running: export BRAVE_API_KEY=your_api_key"
  exit 1
fi

# Проверка доступности портов
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
  echo "Error: Port 3000 is already in use."
  echo "Please close the application using this port and try again."
  exit 1
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
  echo "Error: Port 5173 is already in use."
  echo "Please close the application using this port and try again."
  exit 1
fi

# Функция для правильного завершения всех процессов
cleanup() {
  echo "Shutting down all processes..."
  kill $SERVER_PID $INSPECTOR_PID 2>/dev/null
  exit 0
}

# Установка обработчика сигналов
trap cleanup SIGINT SIGTERM

# Запуск MCP Inspector
echo "Starting MCP Inspector..."
npx @modelcontextprotocol/inspector &
INSPECTOR_PID=$!

# Ожидание запуска Inspector
sleep 3

# Запуск OpenDeepSearch сервера
echo "Starting OpenDeepSearch server..."
node dist/index.js &
SERVER_PID=$!

echo ""
echo "======================================================"
echo "MCP Inspector running at: http://localhost:5173"
echo "OpenDeepSearch server running at: ws://localhost:3000"
echo "======================================================"
echo ""
echo "Press Ctrl+C to stop both processes."

# Ожидание завершения процессов
wait $SERVER_PID $INSPECTOR_PID

# Вызов cleanup при выходе
cleanup 