# VeciApp Backend

Backend API para la aplicación VeciApp desarrollada con Express.js.

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone [url-del-repositorio]
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```plaintext
   PORT=3000
   NODE_ENV=development
   ```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo con recarga automática
- `npm start`: Inicia el servidor en modo producción

## Estructura del Proyecto

```plaintext
veciapp-backend/
├── src/
│   ├── app.js      # Configuración de Express
│   └── server.js   # Punto de entrada de la aplicación
├── .env            # Variables de entorno
├── .gitignore      # Archivos ignorados por git
└── package.json    # Dependencias y scripts
```

## Tecnologías Utilizadas

- Express.js - Framework web
- Cors - Middleware para habilitar CORS
- Dotenv - Manejo de variables de entorno
- Nodemon - Recarga automática durante desarrollo

## API Endpoints

### Base URL

```plaintext
http://localhost:3000
```

### Endpoints Disponibles

- `GET /`: Endpoint de bienvenida
  - Respuesta: `{ "message": "Welcome to the API" }`

## Contribución

1. Crea un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios y haz commit (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

ISC