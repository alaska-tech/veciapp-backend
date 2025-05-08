import app from './app';
import { initializeDatabase } from './config/database';
import {PORT} from './utils/constants'

// Inicializar base de datos
initializeDatabase()
    .then(() => {
      // Iniciar servidor
      app.listen(PORT || 3001, () => {
        console.log(`Servidor veciapp corriendo en puerto ${PORT}`);
      });
    })
    .catch(error => {
      console.error("Error al iniciar la aplicación:", error);
    });
