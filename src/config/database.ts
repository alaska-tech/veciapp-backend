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

const baseConfig: DataSourceOptions = {
    type: "postgres",
    host: DB_HOST || "149.28.199.50",
    port: parseInt(DB_PORT || "5432"),
    username: DB_USER || "postgres",
    password: DB_PASSWORD || "ELjyqZFtL8G7goDEYo0Ek5TnE8G2AnLp",
    database: DB_NAME || "deliverydb",

    synchronize: NODE_ENV !== "production",
    logging: NODE_ENV !== "production",

    // Configuración de modelos
    entities: [
        Customer, Vendor, Branch, Account, Category, Order, Parameter, Payment, ProductService, ShoppingCart, Testimonial, Wishlist
    ],

    migrations: [path.join(__dirname, "../migration/**/*.{js,ts}")],
    subscribers: [path.join(__dirname, "../subscriber/**/*.{js,ts}")],

    // Configuración para PostGIS
    extra: {
        ssl: false,
        // Esto asegura que la extensión PostGIS esté habilitada
        options: `-c search_path=public,postgis`
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