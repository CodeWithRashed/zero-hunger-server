import express from "express";
const app = express();
import cors from "cors";
//Env Config
import "dotenv/config";

//Import jwt
import jwt from "jsonwebtoken";
import cookieParser from 'cookie-parser'

//Database Dependency
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
const port = process.env.PORT || 3000;

//Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//Server Port

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
   client.connect()
    //Connect To Cluster Database
    const zeroHungerDB = client.db("zeroHunger");
    //User Collection
    const zeroHungerUserCollection = zeroHungerDB.collection("users");
    //Foods Collection
    const foodCollection = zeroHungerDB.collection("food");

    //Request Item Collections
    const requestCollection = zeroHungerDB.collection("requestItems");

    app.post("/api/v1/add/user", async (req, res) => {
      const data = req.body;
      const result = await zeroHungerUserCollection.insertOne(data);
      res.send(result);
    });

    //Sending Product Data to Database
    app.post("/api/v1/add/food", async (req, res) => {
      const productData = req.body;
      const result = await foodCollection.insertOne(productData);
      res.send(result);
    });

    //getting products data form database
    app.get("/api/getProduct", async (req, res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //getting single product data form database
    app.get("/api/getProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    //add cart items to database
    app.post("/api/addCartItem", async (req, res) => {
      const cartItem = req.body;
      const result = await requestCollection.insertOne(cartItem);
      res.send(result);
    });

    //sending cart product to user
    app.get("/api/getCartItems", async (req, res) => {
      const cursor = requestCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //jwt auth
    app.post("/api/jwt", async (req, res) => {
      const userEmail = req.body;
      // jwt.sign("payload", "secret", "option")
      console.log(userEmail);
      const secret =
        "681a49f2c6a81a86dfc89593e6640c7699075ff412968bce2647d71e5680225f88fc26941aa5b5c3bc46aeef490ba1b439779bc8d174d2547507c230418f9e95";
      const token = jwt.sign(userEmail, secret, { expiresIn: "1h" });
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.send({ message: "cookie set successful" });
    });

    //Jwt Clear Cookie
    app.post("/api/clear", async (req, res) => {
      res.clearCookie('token').send({ message: "cookie cleared" });
      console.log("cleared");
    });

    //delete cart product to user
    app.delete("/api/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { id: id };
      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/api/update/:id", async (req, res) => {
      const id = req.params.id;
      const changeProduct = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateProduct = {
        $set: {
          productName: changeProduct.productName,
          productImage: changeProduct.productImage,
          brandName: changeProduct.brandName,
          productType: changeProduct.productType,
          productPrice: changeProduct.productPrice,
          productRatting: changeProduct.productRatting,
          productDescription: changeProduct.productDescription,
        },
      };
      const result = await foodCollection.updateOne(
        filter,
        updateProduct,
        options
      );
      res.send(result);
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
