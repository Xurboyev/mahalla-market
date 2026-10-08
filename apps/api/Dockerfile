FROM node:22-alpine AS build
WORKDIR /app
COPY apps/api/package*.json ./
RUN npm ci
COPY apps/api/ ./
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
EXPOSE 4000
# Avval migratsiyalar, keyin server
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/main.js"]
