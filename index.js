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

};
run().catch(error => console.log(error));




app.get("/", (req, res) => {
    res.send("Bismillahi Rahmanir Rahim, Successfull Running machineries server");
});


app.listen(port, () => console.log(`machineries running ${port}`.bgCyan));
