const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;

// midileWare 
app.use(cors());
app.use(express.json())

// server Side Code Running.

app.get('/',(req,res)=>{
    res.send('Assalamualikom . Bistro Boss Server Is Running')
})

app.listen(port, ()=> {
    console.log('Hey! Dev. No Pain No Gain');
})