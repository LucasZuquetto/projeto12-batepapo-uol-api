import express from 'express';
import cors from 'cors'
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const mongoClient = new MongoClient(process.env.MONGO_URI)
let db
app.use(express.json())
app.use(cors())

mongoClient.connect().then(() =>{
    db = mongoClient.db('UolChat')
})

app.post('/participants', (req,res) =>{
    const { name } = req.body
    db.collection('UolChat').insertOne({
        name:name,
        lastStatus: Date.now()
    })
    res.status(201).send()
})

app.get('/participants', (req,res) => {
    db.collection('UolChat').find().toArray().then((users)=>res.send(users))
    
})

app.listen(5000, () => console.log('Listening on port 5000'))