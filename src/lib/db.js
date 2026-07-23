import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/tvmpiapp";

let client;
let db;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
    global._mongoClientPromise = global._mongoClient.connect();
  }
  client = global._mongoClient;
  db = client.db("tvmpiapp");
} else {
  client = new MongoClient(uri);
  db = client.db("tvmpiapp");
}

export { client, db };
export async function getDb() {
  if (process.env.NODE_ENV === "development") {
    await global._mongoClientPromise;
  } else {
    await client.connect();
  }
  return db;
}
