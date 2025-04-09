import app from './app';
import { initializeDatabase } from './config/database';

const PORT = process.env.PORT || 3000;

// Inicializar base de datos
initializeDatabase()
    .then(() => {
      // Iniciar servidor
      app.listen(PORT, () => {
        console.log(`Servidor veciapp corriendo en puerto ${PORT}`);
      });
    })
    .catch(error => {
      console.error("Error al iniciar la aplicación:", error);
    });
