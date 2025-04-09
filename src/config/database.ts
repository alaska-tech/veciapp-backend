import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import path from "path";

/*import { User } from "../models/User";
import { Vendor } from "../models/Vendor";
import { Branch } from "../models/Branch";*/

const isProduction = process.env.NODE_ENV === 'production';

const baseConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "tu_usuario",
    password: process.env.DB_PASSWORD || "tu_contraseña",
    database: process.env.DB_NAME || "tu_base_de_datos",

    // Configuración de modelos
    entities: [
       // Account, Vendor, Branch
    ],

    // Ubicación de migraciones (cuando las tengamos)
    migrations: [path.join(__dirname, '../migrations/**/*.ts')],

    // Configuraciones adicionales
    synchronize: !isProduction, // Cuidado en producción
    logging: !isProduction,

    // Configuración para PostGIS
    extra: {
        postgisExtension: true
    }
};

export const AppDataSource = new DataSource(baseConfig);

// Función para inicializar la conexión
export const initializeDatabase = async () => {
    try {
        //await AppDataSource.initialize();
        console.log("Conexión a la base de datos establecida");
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
        process.exit(1);
    }
};