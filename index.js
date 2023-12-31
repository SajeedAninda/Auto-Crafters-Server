const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ruhvmdy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        const brandCollection = client.db("brandDataDB").collection("brandDataCollection");
        const productCollection = client.db("brandDataDB").collection("productCollection");
        const cartCollection = client.db("brandDataDB").collection("cartCollection");

        // BRAND DATA 
        app.get("/brand", async (req, res) => {
            const result = await brandCollection.find().toArray();
            res.send(result);
        });
        app.get("/brand/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = await brandCollection.findOne(query);
            res.send(result);
        });


        // PRODUCTS DATA 
        app.post("/products", async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            // console.log(result);
            res.send(result);
        });
        app.get("/products", async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result);
        });
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = await productCollection.findOne(query);
            // console.log(result);
            res.send(result);
        });
        app.put("/products/:id", async (req, res) => {
            const id = req.params.id;
            const productData = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedProducts = {
                $set: {
                    productName: productData.productName,
                    brand: productData.brand,
                    imgUrl: productData.imgUrl,
                    productPrice: productData.productPrice,
                    productType: productData.productType,
                    productDescription: productData.productDescription,
                    rating: productData.rating
                },
            };
            const result = await productCollection.updateOne(filter, updatedProducts, options);
            res.send(result);
        });

        // CART DATA 
        app.post("/cart", async (req, res) => {
            const cart = req.body;
            const existingProduct = await cartCollection.findOne({ userEmail: cart.userEmail, productName: cart.productName });
        
            if (existingProduct) {
                return res.status(400).json({ success: false, error: "Product already exists in the cart" });
            }
        
            const result = await cartCollection.insertOne(cart);
            if (!result) {
                return res.status(500).json({ success: false, error: "Failed to insert product" });
            }
        
            res.status(201).json({ success: true, insertedId: result.insertedId });
        });
        


        app.get("/cart", async (req, res) => {
            const result = await cartCollection.find().toArray();
            res.send(result);
        });
        app.delete("/cart/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get("/", (req, res) => {
    res.send("Server Running");
});

app.listen(port);  