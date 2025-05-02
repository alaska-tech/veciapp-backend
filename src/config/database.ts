import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import path from "path";
import {
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
} from '../utils/constants'

import { UserEntity} from "../models/user.entity";
import { Customer} from "../models/customer.entity";
import { Vendor} from "../models/vendor.entity";
import { Branch} from "../models/branch.entity";
import { Account} from "../models/account.entity";
import { Category} from "../models/category.entity";
import { Order} from "../models/order.entity";
import { Parameter} from "../models/parameter.entity";
import { Payment} from "../models/payment.entity";
import { ProductService} from "../models/productservice.entity";
import { ShoppingCart} from "../models/shoppingcart.entity";
import { Testimonial} from "../models/testimonial.entity";
import { Wishlist} from "../models/wishlist.entity";

const isProduction = NODE_ENV === 'production';
const baseConfig: DataSourceOptions = {
    type: "postgres",
    url: DB_HOST || "",
    //port: parseInt(DB_PORT || ""),
    /*username: DB_USER || "",
    password: DB_PASSWORD || "",
    database: DB_NAME || "",*/

    // Configuración de modelos
    entities: [
        UserEntity, Customer, Vendor, Branch, Account, Category, Order, Parameter, Payment, ProductService, ShoppingCart, Testimonial, Wishlist
    ],

    // Ubicación de migraciones (cuando las tengamos)
    migrations: [path.join(__dirname, '../migrations/**/*.ts')],

    // Configuraciones adicionales
    synchronize: false, //!isProduction         // Cuidado en producción
    logging: ['error'],
    // Configuración para PostGIS

    extra: {
        postgisExtension: true,
        ssl: {
            rejectUnauthorized: false, // Necesario para Xata
        },
    }
};

export const AppDataSource = new DataSource(baseConfig);

// Función para inicializar la conexión
export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Conexión a la base de datos establecida");
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
        process.exit(1);
    }
};