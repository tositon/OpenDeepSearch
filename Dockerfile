FROM node:16-alpine

WORKDIR /app

# Копирование файлов package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка проекта
RUN npm run build

# Установка переменных окружения
ENV PORT=3000
ENV NODE_ENV=production

# Открытие порта
EXPOSE 3000

# Запуск приложения
CMD ["node", "dist/index.js"] 