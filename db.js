
import "dotenv/config";
import { MongoClient } from "mongodb";

const client = new MongoClient(import { MongoClient } from 'mongodb';

const client = new MongoClient("mongodb://pranshukumar30072006_db_user:<db_password>@ac-mxpwxkk-shard-00-00.e8rkem9.mongodb.net:27017,ac-mxpwxkk-shard-00-01.e8rkem9.mongodb.net:27017,ac-mxpwxkk-shard-00-02.e8rkem9.mongodb.net:27017/?ssl=true&replicaSet=atlas-uhet2a-shard-0&authSource=admin&compressors=zlib");

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await client.close();
});

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
