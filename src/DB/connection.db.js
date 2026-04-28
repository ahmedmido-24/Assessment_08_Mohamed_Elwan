import { MongoClient } from "mongodb";
import { DB_NAME, DB_URI } from './../../config/config.service.js';

export const client = new MongoClient(DB_URI, {serverSelectionTimeoutMS:5000})

export const db = client.db(DB_NAME)

export const authenticateDB = async () => {
    try {
        await client.connect();
        console.log(`Database is connected successfully`);
        return client
    } catch (error) {
        console.error(`fail to connect to database: ${error.message}`)
        process.exit(1);
    }
}