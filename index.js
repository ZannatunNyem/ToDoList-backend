// const dns = require("dns");
// dns.setServers(["8.8.8.8", "1.1.1.1"]);

// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const { MongoClient, ServerApiVersion } = require("mongodb");

// const app = express();
// const port = 3000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB URI
// const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.0cvs0uq.mongodb.net/?appName=Cluster0`;

// // Mongo Client
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     await client.connect();

//     const db = client.db("taskDB");
//     const taskCollection = db.collection("tasks");

//     // Root route
//     app.get("/", (req, res) => {
//       res.send("Server is running ✅");
//     });

//     // Add task
//     app.post("/allTask", async (req, res) => {
//       try {
//         const taskData = req.body;
//         const result = await taskCollection.insertOne(taskData);
//         res.send(result);
//       } catch (err) {
//         console.error(err);
//         res.status(500).send({ error: "Failed to insert task" });
//       }
//     });

//     // Get all tasks
//     app.get("/allTask", async (req, res) => {
//       try {
//         const result = await taskCollection.find().toArray();
//         res.send(result);
//       } catch (err) {
//         console.error(err);
//         res.status(500).send({ error: "Failed to get tasks" });
//       }
//     });

//     // Get today tasks
//     app.get("/todayTask", async (req, res) => {
//       try {
//         const today = new Date().toISOString().split("T")[0];
//         const result = await taskCollection.find({ date: today }).toArray();
//         res.send(result);
//       } catch (err) {
//         console.error(err);
//         res.status(500).send({ error: "Failed to get today tasks" });
//       }
//     });

//     // Get upcoming tasks
//     app.get("/upcomingTask", async (req, res) => {
//       try {
//         const today = new Date().toISOString().split("T")[0];
//         const result = await taskCollection
//           .find({ date: { $gt: today } })
//           .toArray();
//         res.send(result);
//       } catch (err) {
//         console.error(err);
//         res.status(500).send({ error: "Failed to get upcoming tasks" });
//       }
//     });

//     // Update task status
//     app.patch("/updateStatus/:id", async (req, res) => {
//       try {
//         const id = req.params.id;
//         const { status } = req.body;

//         const result = await taskCollection.updateOne(
//           { _id: new ObjectId(id) },
//           { $set: { status } },
//         );

//         res.send(result);
//       } catch (err) {
//         console.error(err);
//         res.status(500).send({ error: "Failed to update task" });
//       }
//     });

//     // Delete task
//     app.delete("/delete/:id", async (req, res) => {
//       try {
//         const id = req.params.id;

//         const result = await taskCollection.deleteOne({
//           _id: new ObjectId(id),
//         });

//         res.send(result);
//       } catch (err) {
//         console.error(err);
//         res.status(500).send({ error: "Failed to delete task" });
//       }
//     });

//     // Mongo ping
//     await client.db("admin").command({ ping: 1 });
//     console.log("MongoDB connected successfully ✅");
//   } catch (err) {
//     console.error(err);
//   }
// }

// run().catch(console.dir);

// // Start server
// app.listen(port, () => {
//   console.log(`Server running on port ${port} 🚀`);
// });

// // client.connect().then(run);

// // module.exports = app;

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb"); // ✅ ObjectId imported

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.0cvs0uq.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ✅ Cache the connection — critical for serverless
let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client.db("taskDB");
}

// Root
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Add task
app.post("/allTask", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("tasks").insertOne(req.body);
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to insert task" });
  }
});

// Get all tasks
app.get("/allTask", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("tasks").find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to get tasks" });
  }
});

// Get today tasks
app.get("/todayTask", async (req, res) => {
  try {
    const db = await connectDB();
    const today = new Date().toISOString().split("T")[0];
    const result = await db.collection("tasks").find({ date: today }).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to get today tasks" });
  }
});

// Get upcoming tasks
app.get("/upcomingTask", async (req, res) => {
  try {
    const db = await connectDB();
    const today = new Date().toISOString().split("T")[0];
    const result = await db
      .collection("tasks")
      .find({ date: { $gt: today } })
      .toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to get upcoming tasks" });
  }
});

// Update task status
app.patch("/updateStatus/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { status } = req.body;
    const result = await db.collection("tasks").updateOne(
      { _id: new ObjectId(req.params.id) }, // ✅ now works
      { $set: { status } },
    );
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to update task" });
  }
});

// Delete task
app.delete("/delete/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("tasks").deleteOne({
      _id: new ObjectId(req.params.id), // ✅ now works
    });
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to delete task" });
  }
});

// ✅ Export for Vercel — no app.listen()
module.exports = app;
