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
    const usersCollection = database.collection("users");

    try {



        // save user on database with role / unrole / admin--- 
        app.post("/user", async (req, res) => {
            const user = req?.body;
            const query = { email: user?.email };
            const findUser = await usersCollection.findOne(query);
            if (findUser) {
                res.send({
                    success: false,
                    message: `${user?.email} Already register, pls login`,
                });
            } else {
                const result = await usersCollection.insertOne(user);
                res.send({
                    success: true,
                    message: `Successfully Create the user ${user?.email}`,
                    data: result,
                });
            };
            // console.log(user);
            // console.log(result);


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
            });

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
