import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import sequelize from './config/database.js'
import './models/index.js'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser';

import auth from './routes/auth.js'
import organization from './routes/organization.js'
import assets from './routes/asset.js'
import { authMiddleware } from './middleware/auth.js'



dotenv.config()

const app = express()

const __filename= fileURLToPath(import.meta.url)
const __dirname= path.dirname(__filename)

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});


app.use('/api/auth',auth)
app.use('/api',organization)
app.use('/api/assets',assets)


const port = process.env.SERVER_PORT || 8000

app.set('view engine','pug')
app.set('views', path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, 'public')));


const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

async function startServer() {
    try {

       connectDB()
       //sync tables
       await sequelize.sync({alter:true})
       console.log("table syced")
        app.listen(port, () => {
            console.log(`Server is Running on ${port}`)
        })
    } catch (error) {
        console.error("Error in starting server", error)
    }
}

startServer()