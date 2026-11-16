
import "dotenv/config";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
    try {
        await client.connect();

        console.log("You successfully connected to MongoDB!");

        return client;
    } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        throw err;
    }
}

export async function disconnectFromMongoDB() {
    await client.close();
}
