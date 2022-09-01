import express from 'express';
import cors from 'cors'
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv'
import dayjs from 'dayjs';

dotenv.config()
const app = express()
const mongoClient = new MongoClient(process.env.MONGO_URI)
let dbParticipants
let dbMessages
app.use(express.json())
app.use(cors())

mongoClient.connect().then(() =>{
    dbParticipants = mongoClient.db('UolParticipants')
})
mongoClient.connect().then(() =>{
    dbMessages = mongoClient.db('UolMessages')
})

app.post('/participants', (req,res) =>{
    const { name } = req.body
    dbParticipants.collection('UolParticipants').insertOne({
        name:name,
        lastStatus: Date.now()
    })
    res.status(201).send()
})

app.get('/participants', (req,res) => {
    dbParticipants.collection('UolParticipants').find().toArray().then((users)=>res.send(users))
})

app.post('/messages', (req,res) => {
    const user = req.headers.user
    const time = dayjs().format('HH:mm:ss')
    const messageObject = {
        ...req.body,
        from:user
    }
    dbMessages.collection('UolMessages').insertOne({
        ...messageObject,
        time:time
    })
    res.status(201).send()
})

app.get('/messages', (req,res) => {
    const limit = parseInt(req.query.limit)
    const user = req.headers.user
    if(!limit){
        dbMessages.collection('UolMessages').find({$or:[{from:user},{to:user},{to:'Todos'}]}).toArray().then((messages) => res.send(messages))
    }else{
        dbMessages.collection('UolMessages').find({$or:[{from:user},{to:user},{to:'Todos'}]}).toArray().then((messages) => res.send(messages.slice(-limit)))
    }
})

app.listen(5000, () => console.log('Listening on port 5000'))