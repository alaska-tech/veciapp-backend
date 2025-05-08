FROM node:18-alpine

WORKDIR /app

# Instalar dependencias para PostGIS
RUN apk add --no-cache --virtual .build-deps \
    postgresql-dev \
    g++ \
    make \
    python3

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos del proyecto
COPY . .

# Compilar código TypeScript (si es necesario)
RUN npm run build

# Limpiar dependencias de desarrollo
RUN npm prune --production

# Exponer puerto
EXPOSE 3001

# Iniciar la aplicación
CMD ["npm", "start"]