import express from 'express';
import cors from 'cors'
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv'
import dayjs from 'dayjs';

//post /status
//remoção automatica de usuarios
//validação com mongo e com joy
//bonus
//prettier
//refatorar com async await
//o que é new do javascript 

dotenv.config()
const app = express()
const mongoClient = new MongoClient(process.env.MONGO_URI)
let db
app.use(express.json())
app.use(cors())

mongoClient.connect().then(() =>{
    db = mongoClient.db('Bate-Papo-Uol')
})

app.post('/participants', (req,res) =>{
    const { name } = req.body
    db.collection('Uol-Participants').insertOne({
        name:name,
        lastStatus: Date.now()
    })
    res.status(201).send()
})

app.get('/participants', (req,res) => {
    db.collection('Uol-Participants').find().toArray().then((users)=>res.send(users))
})

app.post('/messages', (req,res) => {
    const user = req.headers.user
    const time = dayjs().format('HH:mm:ss')
    const messageObject = {
        ...req.body,
        from:user
    }
    db.collection('Uol-Messages').insertOne({
        ...messageObject,
        time:time
    })
    res.status(201).send()
})

app.get('/messages', (req,res) => {
    const limit = parseInt(req.query.limit)
    const user = req.headers.user
    if(!limit){
        db.collection('Uol-Messages').find({$or:[{from:user},{to:user},{to:'Todos'}]}).toArray().then((messages) => res.send(messages))
    }else{
        db.collection('Uol-Messages').find({$or:[{from:user},{to:user},{to:'Todos'}]}).toArray().then((messages) => res.send(messages.slice(-limit)))
    }
})

app.listen(5000, () => console.log('Listening on port 5000'))