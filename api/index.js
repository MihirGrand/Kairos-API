const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(
  cors(/*{
    origin: "https://kairosdash.vercel.app",
  }*/)
);
app.use(express.json());
const PORT = process.env.PORT || 3000;
const client = new MongoClient(process.env.MONGO_CONN_URL);

app.listen(PORT, async () => {
  try {
    await client.connect();
    console.log("Kairos API Listening on PORT:", PORT);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
});

app.get("/", async (req, res) => {
  res.send("Kairos API");
});

app.get("/get_logs", async (request, response) => {
  if (request.query.token == process.env.GRAND_API_PASS) {
    try {
      const database = client.db("Kairos");
      const collection = database.collection("history");
      const data = await collection.find().toArray();
      res.json(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).send("Error fetching data");
    }
  }
});

app.post("/add_log", async (request, response) => {
  if (request.query.token == process.env.GRAND_API_PASS) {
    try {
      await addLog(request.query.duration, request.query.sessions);
      res.sendStatus(200);
    } catch (err) {
      response.sendStatus(500);
      console.log(err);
    }
  }
});

async function addLog(duration, sessions) {
  const database = client.db("Kairos");
  const collection = database.collection("history");
  const result = await collection.insertOne({
    date: new Date(),
    duration: duration,
    sessions: sessions,
  });
  console.log(duration, sessions);
}
