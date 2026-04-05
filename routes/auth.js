import express from 'express'
import { login, logout, registerUser} from '../controllers/authController.js'

const router=express.Router()



router.post('/register',registerUser)
router.post('/login',login)
router.post('/logout',logout)

router.get('/layout',(req,res)=>res.render('layout'))
router.get('/register',(req,res)=>res.render('register'))
router.get('/login',(req,res)=>res.render('login'))



export default router