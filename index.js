const express = require('express');
const cors = require('cors');
require("dotenv").config();   // NB: initialized before port= process.env
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
require("colors");
const app = express();
// payment strip secret key----------


//mongoDB-------------
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zwgt8km.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




// middleware ------------
app.use(cors());
app.use(express.json());





// middleware  >>JWT<<  (cross match function)----




async function run() {

    //MONGODB COLLECTIONS --------
    const database = client.db("machineries-sells");
    const productsCategoryCollection = database.collection("productsCategory");
    const productsCollection = database.collection("products");
    const usersCollection = database.collection("users");
    const bookingsCollection = database.collection("bookings");

    try {


        // get category array of products--
        app.get("/productsCategory", async (req, res) => {
            const query = {};
            const result = await productsCategoryCollection.find(query).toArray();
            res.send({
                success: true,
                message: "Successfully get all products",
                data: result,
            });
        });



        // get all(all) products and by category(under category all)  ---
        app.get("/products/:id", async (req, res) => {
            const categorySize = req?.params?.id;
            let query = { categorySize: categorySize };
            if (categorySize === "all") {
                query = {};
            };
            const result = await productsCollection.find(query).toArray();
            res.send({
                success: true,
                message: "Successfully get all products",
                data: result,
            });
        });

        // get product (one Product )/ details by product id---
        app.get("/product/:id", async (req, res) => {
            const id = req?.params?.id;
            let query = { _id: ObjectId(id) };
            // find on(but find/all . to array method for make array)---
            const result = await productsCollection.findOne(query);
            res.send({
                success: true,
                message: "Successfully get all products",
                data: result,
            });
        });



        // insert add product / seller add the product---
        app.post("/products", async (req, res) => {
            const product = req?.body;
            const result = await productsCollection.insertOne(product);
            if (result.acknowledged) {
                res.send({
                    success: true,
                    message: "Successfully get all products",
                    data: result,
                });
            };
        });

        // get products by seller email adress ------
        app.get("/myProducts", async (req, res) => {
            const email = req.query?.email;
            const query = { sellerEmail: email };
            const result = await productsCollection.find(query).toArray();
            res.send({
                success: true,
                message: `Succesfully get all product of ${email}`,
                data: result,
            });
        });


        // add products as advertisemetn ----
        app.put("/advertised/products/:id", async (req, res) => {
            const id = req?.params?.id;
            const filter = { _id: ObjectId(id) };
            const advertiseName = req?.body?.advertiseName;
            // console.log(id, advertiseName);
            const foundProduct = productsCollection.findOne(filter);
            if (foundProduct.advertiseName) {
                res.send({
                    success: false,
                    message: `Product ID: ${id} already on advertise: ${advertiseName} `,
                });
            } else {
                const updateDoc = {
                    $set: {
                        advertiseName: advertiseName,
                    }
                };
                const options = { upsert: true };
                const result = await productsCollection.updateOne(filter, updateDoc, options);
                if (result?.acknowledged) {
                    res.send({
                        success: true,
                        message: `Product ID: ${id} successfully add advertisement sections`,
                        data: result,
                    });
                } else {
                    res.send({
                        success: false,
                        message: `Product ID: ${id} already on advertise: ${advertiseName} or something happened wrong `,
                    });
                };
            };
            // console.log("finished add function")
        });

        // get products by advertisement ----
        app.get("/advertised/products", async (req, res) => {
            const query = {};
            const result = await productsCollection.find(query).toArray();
            const advertise = result?.filter(r => r.advertiseName)
            if (advertise.length) {
                res.send({
                    success: true,
                    message: "Successfully get all products",
                    data: advertise,
                });
            } else {
                res.send({
                    success: false,
                    message: "No advertisement product found",
                });
            };
        });




        //booking the products if didn't same---
        app.post("/bookings", async (req, res) => {
            const bookingProduct = req?.body;
            const result = await bookingsCollection.insertOne(bookingProduct);
            if (result.acknowledged) {
                res.send({
                    success: true,
                    message: ` Dear ${bookingProduct?.buyerName}, Your Successfully Booked.`,
                    data: result,
                })
            } else {
                res.send({
                    success: false,
                    message: ` Dear ${bookingProduct?.buyerName} Booked NOT POSSIBLE. for .`,
                    data: result,
                });
            };
        });


        // show booking by user/buyer ---
        app.get("/mybooking", async (req, res) => {
            const email = req.query?.email;
            const query = { buyerEmail: email };
            const result = await bookingsCollection.find(query).toArray();
            if (result) {
                res.send({
                    success: true,
                    message: "Successfully get your orders.",
                    data: result,
                })
            } else {
                res.send({
                    success: false,
                    message: ` Dear ${bookingProduct?.buyerName} Booked NOT POSSIBLE. for .`,
                    data: result,
                });
            };
            // console.log("bookingsss")
        });

        // show user/BUYER =(MY BUYER) info by seller email ---
        app.get("/mybuyer", async (req, res) => {
            const email = req.query?.email;
            const query = { sellerEmail: email };
            const result = await bookingsCollection.find(query).toArray();
            if (result) {
                res.send({
                    success: true,
                    message: "Successfully get your orders.",
                    data: result,
                })
            } else {
                res.send({
                    success: false,
                    message: ` Dear ${bookingProduct?.buyerName} Booked NOT POSSIBLE. for .`,
                    data: result,
                });
            };
            // console.log("bookingsss")
        });



        // get user buyer seller admin ---
        app.get("/user/:type", async (req, res) => {
            const type = req?.params?.type;
            let query = { role: type };
            if (type === "all") {
                query = {};
                const result = await usersCollection.find(query).toArray();
                const buyer = result.filter(r => !r.role);
                res.send({
                    success: true,
                    message: `Successfully got all ${type}.`,
                    data: buyer,
                });
            } else {
                const result = await usersCollection.find(query).toArray();
                if (result.length) {
                    res.send({
                        success: true,
                        message: `Successfully got all ${type}.`,
                        data: result,
                    });
                } else {
                    res.send({
                        success: false,
                        message: "Something wrond no type found",
                    });
                };
            };
            // console.log(type);
        });

        // delete user buyer seller from database -----
        app.delete("/user/:id", async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send({
                success: true,
                message: `Successfully deleted Id: ${id}.`,
                data: result,
            });
            // console.log(query);
        });


        // save user on database with role / unrole / admin--- 
        // gate user from database (2 work in 1 function)
        app.post("/user", async (req, res) => {
            const user = req?.body;
            const query = { email: user?.email };
            const findUser = await usersCollection.findOne(query);
            if (!findUser) {
                // create new user on db --
                const result = await usersCollection.insertOne(user);
                res.send({
                    success: true,
                    message: `Successfully Create the user ${user?.email}`,
                    data: result,
                });
            } else {
                // get already exist user from db--
                res.send({
                    success: false,
                    message: `${user?.email} Already user on my Data Base`,
                    data: findUser,
                });
            };
            // console.log("call get user function", "under get user function")
        });

        // create & send token to clientSide for store localStorage-- 
        app.get("/jwt", async (req, res) => {
            const email = req?.query?.email;
            const query = { email: email };
            const findUser = await usersCollection.findOne(query);
            if (findUser) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN);
                // const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: "1h"});
                res.send({
                    success: true,
                    message: "Successfully got/create the token",
                    data: token,
                });
            } else {
                res.status(403).send({
                    success: false,
                    message: "UnAuthorize user login/signUp again.",
                });
            };
            // console.log(query)
        });


    } catch (error) {
        console.log("Catch error from under try>> catch function:", error);
    };

};
run().catch(error => console.log(error));




app.get("/", (req, res) => {
    res.send("Bismillahi Rahmanir Rahim, Successfull Running machineries server");
});


app.listen(port, () => console.log(`machineries running ${port}`.bgCyan));

