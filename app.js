import express from 'express';
import cors from 'cors'
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv'
import dayjs from 'dayjs';
import joi from 'joi'

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

const participantSchema = joi.object({
    name: joi.string().required()
})

mongoClient.connect().then(() =>{
    db = mongoClient.db('Bate-Papo-Uol')
})

app.post('/participants', async (req,res) =>{
    const { name } = req.body
    const time = dayjs().format('HH:mm:ss')
    const userExists = await db.collection('Uol-Participants').findOne({name:name})
    const validation = participantSchema.validate(req.body, {abortEarly: true})
    if(userExists){
        res.sendStatus(409)
        return
    }
    if(validation.error){
        console.log(validation.error.details.map(detail => console.log(detail.message)))
        res.sendStatus(422)
        return
    }
    try {
        await db.collection('Uol-Participants').insertOne({
            name:name,
            lastStatus: Date.now()
        })
        await db.collection('Uol-Messages').insertOne({
            from:name,
            to:'Todos',
            text:'entra na sala...',
            type:'status',
            time: time
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
        const userStatus = await db.collection('Uol-Participants').findOne({name:user})
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
setInterval(async () => {
    const time = dayjs().format('HH:mm:ss')
    try {
        const afkUsers = await db.collection('Uol-Participants').find({lastStatus:{$lte: Date.now()-10000}}).toArray()
        afkUsers.map(async (afkuser) =>{
            await db.collection('Uol-Messages').insertOne({from:afkuser.name, to:'Todos', text:'sai da sala...', type:'status', time:time})
            await db.collection('Uol-Participants').deleteMany({lastStatus:{$lte: Date.now()-10000}})
        })
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}, 15000);

app.listen(5000, () => console.log('Listening on port 5000'))