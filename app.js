import express from 'express';
import cors from 'cors'
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv'
import dayjs from 'dayjs';

//post /status
//remoção automatica de usuarios
//validação com mongo e com joy
//abort early message
//bonus
//prettier
//refatorar com async await

dotenv.config()
const app = express()
const mongoClient = new MongoClient(process.env.MONGO_URI)
let db
app.use(express.json())
app.use(cors())

mongoClient.connect().then(() =>{
    db = mongoClient.db('Bate-Papo-Uol')
})

app.post('/participants', async (req,res) =>{
    try {
        const { name } = req.body
        await db.collection('Uol-Participants').insertOne({
            name:name,
            lastStatus: Date.now()
        })
        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.get('/participants', async (req,res) => {
    try {
        const participants = await db.collection('Uol-Participants').find().toArray()
        res.send(participants)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.post('/messages', async (req,res) => {
    const {user} = req.headers
    const time = dayjs().format('HH:mm:ss')
    const messageObject = {
        ...req.body,
        from:user
    }
    try {
        await db.collection('Uol-Messages').insertOne({
            ...messageObject,
            time:time
        })
        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.get('/messages', async (req,res) => {
    const limit = parseInt(req.query.limit)
    const {user} = req.headers
    try {
        if (!limit){
            const messages = await db.collection('Uol-Messages').find({$or:[{from:user},{to:user},{to:'Todos'}]}).toArray()
            res.send(messages)
        }else{
            const messages = await db.collection('Uol-Messages').find({$or:[{from:user},{to:user},{to:'Todos'}]}).toArray()
            res.send(messages.slice(-limit))
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.post('/status', async (req, res) => {
    const {user} = req.headers
    try {
        const userStatus = await db.collection('Uol-Participants').find({name:user}).toArray()
        if(!userStatus){
            res.sendStatus(404)
            return
        }
        await db.collection('Uol-Participants').deleteOne({name:user})
        await db.collection('Uol-Participants').insertOne({
            name:user,
            lastStatus: Date.now()
        })
        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.listen(5000, () => console.log('Listening on port 5000'))