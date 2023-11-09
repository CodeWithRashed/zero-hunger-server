import express from "express";
const app = express();
import cors from "cors";

//AUTH AND SECURITY
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import "dotenv/config";

//DATABASE DEPENDENCY
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

//MIDDLEWARES
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

// VARIABLES
const port = process.env.PORT || 3000;
const uri = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.h9t3k.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//APPLICATION START
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello From Express!");
});

async function run() {
  try {
    // DATABASE COMPONENTS AND VARIABLES///
    // connect to mongodb
    client.connect();
    //Connect To Cluster Database
    const zeroHungerDB = client.db("zeroHunger");
    //User Collection
    const zeroHungerUserCollection = zeroHungerDB.collection("users");
    //Foods Collection
    const foodCollection = zeroHungerDB.collection("food");

    //Request Item Collections
    const requestCollection = zeroHungerDB.collection("request");

    ///AUTH ADN SECURITY VERIFY TOKEN AND USER///
    //Create Json web token
    app.post("/api/v1/auth/jwt", async (req, res) => {
      const userEmail = req.body;
      const cookieMaxAge = 24 * 60 * 60 * 1000;

      const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "24h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          expires: new Date(Date.now() + cookieMaxAge),
        })
        .send({ message: "cookie added" });
    });

    //Clear Json web token
    app.post("/api/v1/auth/jwt/clear", async (req, res) => {
      res
        .clearCookie("token", {
          maxAge: 0,
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    ///APPLICATION POST REQUEST///
    //create user and send to database
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

    //create food and send to database
    app.post("/api/v1/user/add/food", async (req, res) => {
      const foodData = req.body;
      const result = await foodCollection.insertOne(foodData);
      res.send(result);
    });

    //add request food items to database
    app.post("/api/v1/food/request/add", async (req, res) => {
      const foodRequest = req.body;
      const result = await requestCollection.insertOne(foodRequest);
      res.send(result);
    });

    ///APPLICATION GET, GET, GET, GET REQUEST///
    //getting single food data form database
    app.get("/api/v1/user/get/food/:id", async (req, res) => {
      const token = req?.cookies?.token;
      //if no token say bye bye
      if (!token) {
        return res.status(401).send({ message: "Unauthorized Access" });
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        //if problem with token say good bye
        if (err) {
          return res.status(401).send({ message: "Unauthorized Access" });
        }
        req.user = decoded;
      });

      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    //getting single request data form database
    app.get("/api/v1/user/get/request/:id", async (req, res) => {
      const id = req.params.id;
      const query = { foodId: id };
      const result = await requestCollection.findOne(query);
      res.send(result);
    });

    //getting data form email query
    app.get("/api/v1/user/get/foods", async (req, res) => {
      let query = {};
      if (req?.query?.email) {
        const token = req?.cookies?.token;
        //if no token say bye bye
        if (!token) {
          return res.status(401).send({ message: "Unauthorized Access" });
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          //if problem with token say good bye
          if (err) {
            return res.status(401).send({ message: "Unauthorized Access" });
          }
          req.user = decoded;
        });
        //if email not match kick him out
        if (req?.user?.userEmail !== req?.query?.email) {
          return res.status(401).send({ message: "Unauthorized Access" });
        }
        query = {
          donarEmail: req.query.email,
        };
      }
      const cursor = foodCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //getting user data from database
    app.get("/api/v1/user/get/users", async (req, res) => {
      const cursor = zeroHungerUserCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //getting food request data
    app.get("/api/v1/user/get/request", async (req, res) => {
      const cursor = requestCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    /// APPLICATION ///PUT || PATCH, PUT || PATCH, PUT || PATCH///  REQUEST ///
    //update food data
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

    //Updating Food delivery Status
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

    /// APPLICATION DELETE, DELETE, DELETE, DELETE REQUEST ///
    //Delete food from database
    app.delete("/api/v1/user/delete/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    //Delete request from database
    app.delete("/api/v1/request/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    ("");
  }
}
run();
