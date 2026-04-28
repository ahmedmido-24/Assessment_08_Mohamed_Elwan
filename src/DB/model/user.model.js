import { db } from "../connection.db.js"

export const users = []

export const UserModel = async () => {
    return await db.createCollection("books", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["title", "author"],
                properties: {
                    title: {
                        bsonType: "string",
                        minLength: 3,
                        description: "title must be at least 3 characters"
                    },
                    author: {
                        bsonType: "string",
                        minLength: 3,
                        description: "author must be at least 3 characters"
                    }
                }
            }
        }
    });
}
