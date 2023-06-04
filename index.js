const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// midileWare 
app.use(cors());
app.use(express.json())

// server Side Code Running.


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jvqibpv.mongodb.net/?retryWrites=true&w=majority`;

// console.log(process.env.DB_PASS);

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
        await client.connect();

        const usersCollection = client.db('bestroboss').collection('users')
        const menuCollection = client.db('bestroboss').collection('menu')
        const cartCollection = client.db('bestroboss').collection('carts')

        /*
        *User Management Operations
        */ 
        // User Get APis;
        app.get('/users',async (req,res)=>{
            const result = await usersCollection.find().toArray();
            res.send(result);
        })
        // users add on Database
        app.post('/users',async(req,res)=>{
            const user = req.body;
            const query = {email: user.email};
            const exitingUser = await usersCollection.findOne(query);
            if(exitingUser){
                // console.log(exitingUser);
                return res.send({Message:'User Already exiting on Database'})
            }
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.send(result)
        })


        // Menu apis 
        app.get('/menu', async (req,res)=>{
            const result = await menuCollection.find().toArray();
            res.send(result) 
        })


        // Carts Collection apis
        
        // Carts Get 
        app.get('/carts',async (req,res)=>{
            const email = req.query.email;
            // console.log(email);
            const query = {email:email};
            const result = await cartCollection.find(query).toArray();
            console.log(result);
            res.send(result)
        })
        // Specific Carts Remove using Id
        app.delete('/carts/:id',async (req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await cartCollection.deleteOne(query);
            res.send(result)
        })
        // Add Carts On Database
        app.post('/carts',async (req,res)=>{
            const item = req.body;
            console.log(item);
            const result = await cartCollection.insertOne(item);
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Assalamualikom . Bistro Boss Server Is Running')
})

app.listen(port, () => {
    console.log('Hey! Dev. No Pain No Gain');
})