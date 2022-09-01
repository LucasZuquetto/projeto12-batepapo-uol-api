import express from 'express';
import cors from 'cors'
import { MongoClient } from 'mongodb';

const app = express()
const mongoClient = new MongoClient('mongodb://localhost:27017')
let db
app.use(express.json())
app.use(cors())

mongoClient.connect().then(() =>{
    db = mongoClient.db('bate-papo')
})

app.listen(5000, () => console.log('Listening on port 5000'))