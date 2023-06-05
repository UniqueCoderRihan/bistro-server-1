const express = require('express');
const app = express();
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// midileWare 
app.use(cors());
app.use(express.json())

// Jwt Verify
const verifyJWT = (req , res, next)=>{
    const authorization = req.headers.authorization;
    if(!authorization){
        return res.status(401).send({error:true, message: 'UnAuthorized Access'})
    }
    // bearer token
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
            return res.status(401).send({error: true, message: 'UnAuthorized Access'});
        }
        req.decoded = decoded;
        next()
    })
}

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

        // jwt token create STEP_2 As a My Note;
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn:'1h'});
            res.send(token);
        })

        // *User Management Operations
        // */ 
        // User Get APis;
        app.get('/users', verifyJWT, async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })
        // users add on Database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const exitingUser = await usersCollection.findOne(query);
            if (exitingUser) {
                // console.log(exitingUser);
                return res.send({ Message: 'User Already exiting on Database' })
            }
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.send(result)
        })

        // check admin mail
        app.get('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
      
            if (req.decoded.email !== email) {
              res.send({ admin: false })
            }
      
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);
          })
        // Make admin... PATCH
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        })



        // Menu apis 
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result)
        })


        // Carts Collection apis

        // Carts Get 
        app.get('/carts', verifyJWT, async (req, res) => {
            const email = req.query.email;
            // console.log(email);

            if(!email){
                res.send([]);
            }
            // check Verification.>> That's Interesting.
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({error:true, message: 'Porbidden  Access'})
            }

            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            console.log(result);
            res.send(result)
        })

        
        // Specific Carts Remove using Id
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query);
            res.send(result)
        })

        // Add Carts On Database
        app.post('/carts', async (req, res) => {
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