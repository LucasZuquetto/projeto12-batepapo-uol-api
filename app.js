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
    db = mongoClient.db('bate-papo')
})

app.listen(5000, () => console.log('Listening on port 5000'))