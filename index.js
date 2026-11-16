
import {
    connectToMongoDB,
    disconnectFromMongoDB
} from "./db.js";

async function main() {
    try {
        const client = await connectToMongoDB();

        const db = client.db("SchoolDB");

        console.log("Database Name:", db.databaseName);
        console.log("MongoDB is ready for CRUD operations!");

    } catch (error) {
        console.error(error.message);
    } finally {
        await disconnectFromMongoDB();
    }
}

main();
