const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://siddhardhakavuru:22pa1a1275@res.uc6rt.mongodb.net/?retryWrites=true&w=majority&appName=res";

async function connect() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    // Access a specific database
    const database = client.db('Project R');
    const collection = database.collection('res');

    // Example query
    const result = await collection.findOne({});
    console.log(result);
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  } finally {
    await client.close();
  }
}

connect();
