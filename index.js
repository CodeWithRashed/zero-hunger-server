import express from "express";
const app = express();
import cors from "cors";
//Env Config
import "dotenv/config";

//Import jwt
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

//Database Dependency
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
const port = process.env.PORT || 3000;

//Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://zero-hunger-client-five.vercel.app",
      "https://zero-hunger-a4e14.firebaseapp.com",
      "https://zero-hunger-a4e14.web.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());



//Database Connection
//URI
const uri = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.h9t3k.mongodb.net/?retryWrites=true&w=majority`;

//Database Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//Database Connect Function
async function run() {
  try {
    client.connect();
    //Connect To Cluster Database
    const zeroHungerDB = client.db("zeroHunger");
    //User Collection
    const zeroHungerUserCollection = zeroHungerDB.collection("users");
    //Foods Collection
    const foodCollection = zeroHungerDB.collection("food");

    //Request Item Collections
    const requestCollection = zeroHungerDB.collection("request");

    app.post("/api/v1/add/user", async (req, res) => {
      const data = req.body;
      const email = req.body.email;
      const query = { email: email };
      const findResult = await zeroHungerUserCollection.findOne(query);
      if (!findResult?.email) {
        const result = await zeroHungerUserCollection.insertOne(data);
        res.send(result);
        return;
      }
      res.send({ message: "user already exits" });
    });

    //Sending Product Data to Database
    app.post("/api/v1/user/add/food", async (req, res) => {
      const foodData = req.body;
      const result = await foodCollection.insertOne(foodData);
      res.send(result);
    });

    //getting products data form database
    app.get("/api/v1/user/get/foods", async (req, res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //getting single product data form database
    app.get("/api/v1/user/get/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    //getting request data form database
    app.get("/api/v1/user/get/request/:id", async (req, res) => {
      const id = req.params.id;
      const query = { foodId: id };
      const result = await requestCollection.findOne(query);
      res.send(result);
    });

    //getting data form email query
    app.get("/api/v1/user/get/foods/:email", async (req, res) => {
      const queryEmail = req.params.email;
      console.log(queryEmail);
      const query = { donarEmail: queryEmail };
      const cursor = foodCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //Updating Product Data
    app.put("/api/v1/user/update/food/:id", async (req, res) => {
      const id = req.params.id;
      const changeFood = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updatedFood = {
        $set: {
          donarName: changeFood.donarName,
          donarImage: changeFood.donarImage,
          foodName: changeFood.foodName,
          foodImage: changeFood.foodImage,
          foodQuantity: changeFood.foodQuantity,
          expireDate: changeFood.expireDate,
          donarEmail: changeFood.donarEmail,
          pickupLocation: changeFood.pickupLocation,
          additionalNote: changeFood.additionalNote,
          deliveryStatus: changeFood.deliveryStatus,
        },
      };
      const result = await foodCollection.updateOne(
        filter,
        updatedFood,
        options
      );
      res.send(result);
    });

    //Delete food from database
    app.delete("/api/v1/user/delete/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    //add request food items to database
    app.post("/api/v1/food/request/add", async (req, res) => {
      const foodRequest = req.body;
      const result = await requestCollection.insertOne(foodRequest);
      res.send(result);
    });

    //getting food request data
    app.get("/api/v1/user/get/request", async (req, res) => {
      const cursor = requestCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/api/v1/request/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });

    //Updating Request Status
    app.put("/api/v1/request/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updatedRequest = {
        $set: {
          requestStatus: "Delivered",
        },
      };
      const result = await requestCollection.updateOne(filter, updatedRequest);
      res.send(result);
    });

    //Updating Food Status
    app.patch("/api/v1/user/update/food/:id", async (req, res) => {
      const id = req.params.id;
      const deliveryStatus = req.body.deliveryStatus;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: false };

      const updatedStatusData = {
        $set: {
          deliveryStatus: deliveryStatus,
        },
      };

      const result = await foodCollection.updateOne(
        filter,
        updatedStatusData,
        options
      );
      res.send(result);
    });

    // JWT AUTH REQUEST
    app.post("/api/v1/auth/jwt", async (req, res) => {
      const userEmail = req.body;
      // jwt.sign("payload", "secret", "option")
      console.log(userEmail);
      const cookieMaxAge = 24 * 60 * 60 * 1000;
      const secret =
        "681a49f2c6a81a86dfc89593e6640c7699075ff412968bce2647d71e5680225f88fc26941aa5b5c3bc46aeef490ba1b439779bc8d174d2547507c230418f9e95";
      const token = jwt.sign(userEmail, secret, { expiresIn: "24h" });
      res.cookie("jwtAuthToken", token, {
          httpOnly: true,
          secure: false,
          expires: new Date(Date.now() + cookieMaxAge)
        })
        .send({ message: "cookie added" });
    });

    // Jwt Clear Cookie
    app.post("/api/v1/auth/jwt/clear", async (req, res) => {
      res.clearCookie("jwtAuthToken").send({ message: "cookie cleared" });
    
    });
  } finally {
    ("");
  }

  
}
run();

app.get("/", (req, res) => {
  res.send("Hello From Express!");
});

//Server Starting Script
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
