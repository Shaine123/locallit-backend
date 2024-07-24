import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import mongoose  from 'mongoose'
import fs from 'fs'
import { fileURLToPath } from 'url'
//@mongoose Schema
import ItemModel from './models/itemSchema.js'
import UserModel from './models/userSchema.js'
import CartModel from './models/cartSchema.js'
import { OAuth2Client } from 'google-auth-library'
import axios from 'axios'
import logReuest from './middleware/logRequest.js'
import OrderModel from './models/orderSchema.js'
import DashboardModel from './models/dashboardSchema.js'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import jwtHandler from './middleware/jwtHandler.js'





const app = express()
dotenv.config()
const PORT = process.env.PORT || 3002
const JWT_SECRET = 'SHAINE'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.json())


mongoose.connect(`${process.env.URL}`)
.then(() => {
     console.log('Database Connected')
})
.catch(() => {
    console.log('Database Failed To Connect')
})

app.use(logReuest)


// app.use((req,res,next) => {
//     res.header('Access-Control-Allow-Headers', ['X-Requested-With','content-type','credentials']); // Correctly setting Permissions-Policy to an empty value
//     res.header('Access-Control-Allow-Methods','GET,POST')
//     next();
  
// })
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
         cb(null,'public/images')
    },
    filename: (req,file,cb) => {
        cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
     storage: storage
})

app.post('/api/post', (req,res,next) =>{
    res.status(200).json({msg:'working'})
})

app.post('/uploadImg',upload.single('file'),(req,res,next) => {
     const img = req.file.filename
    //  ItemModel.create({
    //      image: img
    //  })
    console.log(req.body)
})

app.get('/getImg',(req,res) => {
      ItemModel.find()
      .then(result => res.json(result))
      .catch(error => res.json(error))
})

//@des POST,GET,PUT,DETE for UserSchema
app.post('/addUser',  (req,res,next) => {
     const {username,userimage,firstname,lastname,phonenumber,email,address,password,accesstype} = req.body
     
     UserModel.create({
         username: username,
         userimage: userimage,
         firstname: firstname,
         lastname: lastname,
         phonenumber: phonenumber,
         email: email,
         address: address,
         password: password,
         accesstype: accesstype
     })
     .then((result) => {
          res.status(200).json({info: result, message: 'Successfully Registered'})
     })
     .catch((error) => {
         res.status(400).json(error)
     })
})
app.post('/login', async (req,res,next)  => {
    const {email, password} = req.body
    try{
        const users = await UserModel.findOne({email: email})
       
         if(!users || !( await users.comparePassword(password))){
             return res.status(400).json({message: 'Invalid User or Password'})
         }
         const token = jwt.sign({ email: email, password: password }, JWT_SECRET, { expiresIn: '3h' });
         res.status(200).json({token: token})
    }catch (error){
        res.status(500).send({ message: 'Error logging in user' });
    }
})
app.put('/editUser', jwtHandler, (req,res,next) => {
    const {username,userimage,firstname,lastname,phonenumber,email,address,password,accesstype, id} = req.body

    UserModel.findByIdAndUpdate({_id: id}, {
        username: username,
        userimage: userimage,
        firstname: firstname,
        lastname: lastname,
        phonenumber: phonenumber,
        email: email,
        address: address,
        password: password,
        accesstype: accesstype
    })
    .then((result) => {
        res.status(200).json({info: result, message: 'Changes Saved'})
   })
   .catch((error) => {
       res.status(400).json(error)
   })
})
app.delete('/deletUser/:id',(req,res,next) => {
     const {id} = req.params
     UserModel.findByIdAndDelete({_id: id})
     .then(result => res.status(200).json({info: result,message:'User Deleted'}))
     .catch(error => res.status(400).json(error))
})
app.get('/findUser/:email', (req,res,next) => {
     const {email} = req.params
     UserModel.find({email: email})
     .then((result) => {
        res.status(200).json(result)
   })
   .catch((error) => {
       res.status(400).json(error)
   })
})

app.get('/findUsers',(req,res,next) => {
    UserModel.find()
    .then((result) => {
       res.status(200).json(result)
  })
  .catch((error) => {
      res.status(400).json(error)
  })
})


//@desc POST/DELETE/PUT/GET For ItemSchema
app.post('/uploadItemImage',upload.single('file'),(req,res,next) => {
    res.status(200).json({filename: req.file.filename})
})
app.post('/addItem', jwtHandler,(req,res,next) => {
     const {itemname,price,genre,image,description,reviewDescription,ratings,numberOfReviews} = req.body
     ItemModel.create({
         itemname: itemname,
         price: price,
         genre: genre,
         image: image,
         description: description,
         reviewDescription: reviewDescription,
         ratings: ratings,
         numberOfReviews: numberOfReviews
     })
     .then(result => res.status(200).json({info: result,message:'Item added successfully'}))
     .catch(error => res.status(400).json(error))
})

app.put('/editItem', jwtHandler,(req,res,next) => {
    const {id,oldImage,itemname,price,genre,image,description,reviewDescription,ratings,numberOfReviews} = req.body

    try {
        if(image !== oldImage){
           fs.unlinkSync(path.join(__dirname , 'public/images', `${oldImage}`))
        }
        ItemModel.findByIdAndUpdate({_id:id},{
            itemname: itemname,
            price: price,
            genre: genre,
            image: image,
            description: description,
            reviewDescription: reviewDescription,
            ratings: ratings,
            numberOfReviews: numberOfReviews
        })
        .then(result => res.status(200).json({info: result,message:'Item updated successfully',message2:'Comment sent successfully'}))
        .catch(error => res.status(400).json(error))
    } catch (error) {
        
    }
})
app.delete('/deleteItem/:id/:image', jwtHandler, (req,res,next) => {
     const {id,image} = req.params
     
     fs.unlinkSync(path.join(__dirname , 'public/images', `${image}`))

     ItemModel.findByIdAndDelete({_id: id})
     .then(result => res.status(200).json({info: result,message:'Item deleted successfully'}))
    .catch(error => res.status(400).json(error))
})

app.get('/getItem', (req,res,next) => {
     ItemModel.find().sort({_id:-1})
     .then(result => res.status(200).json(result))
     .catch(error => res.status(400).json(error))
})
app.get('/getOneItem/:id', jwtHandler, (req,res,next) => {
    const {id} = req.params
    ItemModel.find({_id: id})
    .then(result => res.status(200).json(result))
    .catch(error => res.status(400).json(error))
})

//@desc POST/DELETE/PUT/GET For ItemSchema end of this end points


//@desc POST/DELETE/GET For CartSchema start of thins end points

app.post('/addCart', jwtHandler, (req,res,next) => {

    const {userid,username,itemid,itemname,itemprice,itemquantity,itemimage,dateadded} = req.body
    CartModel.create({
        userid: userid,
        username: username,
        itemid: itemid,
        itemname: itemname,
        itemprice: itemprice,
        itemquantity: itemquantity,
        itemimage: itemimage,
        dateadded: dateadded
    })
    .then((result) => res.status(200).json({info:result,message:'Item added to cart successfully'}))
    .catch((error) => res.status(400).json(error))
})

app.put('/editCart', jwtHandler, (req,res,next) => {
    const {userid,username,itemid,itemname,itemprice,itemquantity,itemimage,dateadded,id} = req.body
     CartModel.findByIdAndUpdate({_id:id},{
        userid: userid,
        username: username,
        itemid: itemid,
        itemname: itemname,
        itemprice: itemprice,
        itemquantity: itemquantity,
        itemimage: itemimage,
        dateadded: dateadded
     })
     .then((result) => res.status(200).json({info:result,message:'Item edited in cart successfully'}))
    .catch((error) => res.status(400).json(error))
})

app.delete('/deleteCart/:cart', jwtHandler, (req,res,next) => {
     const {cart} = req.params
     CartModel.findByIdAndDelete({_id:cart})
     .then(result => res.status(200).json({info:result,message:'item deleted'}))
     .catch((error) => res.status(400).json(error))
 
})

app.get('/getCarts/:id', jwtHandler, (req,res,next) => {
    const {id} = req.params
    CartModel.find({userid:id}).sort({_id: -1})
    .then((result) => res.status(200).json(result) )
    .catch((error) => res.status(400).json(error))
})

//@desc end of Cart Schema

//@desc POST/DELETE/PUT/GET of Orders Schema

app.post('/addOrder',jwtHandler,(req,res,next) => {
     const {userid,orders,dateordered,datedelivered,deliverypackage,deliverystatus,userinfo,timeinterval,ordertotal} = req.body

     OrderModel.create({
         userid: userid,
         orders: orders,
         dateordered: dateordered,
         datedelivered:datedelivered,
         deliverypackage: deliverypackage,
         deliverystatus: deliverystatus,
         timeinterval: timeinterval,
         ordertotal: ordertotal,
         userinfo: userinfo
     })
     .then(result => res.status(200).json({info:result, message: 'Order Placed'}))
     .catch(error => res.status(400).json(error))
})

app.put('/editOrder',jwtHandler,(req,res,next) => {
    const {userid,orders,dateordered,datedelivered,deliverypackage,deliverystatus,userinfo,timeinterval,ordertotal,id} = req.body

    OrderModel.findByIdAndUpdate({_id:id},{
        userid: userid,
        orders: orders,
        dateordered: dateordered,
        datedelivered:datedelivered,
        deliverypackage: deliverypackage,
        deliverystatus: deliverystatus,
        timeinterval: timeinterval,
        ordertotal: ordertotal,
        userinfo: userinfo
    })
    .then(result => res.status(200).json({info:result, message: 'Order Changed'}))
    .catch(error => res.status(400).json(error))
})
app.get('/getOrders', jwtHandler, (req,res,next) => {
     OrderModel.find().sort({_id: -1})
     .then(result => res.status(200).json(result))
     .catch(error => res.status(400).json(error))
})

app.get('/getOrders/:id',(req,res,next) => {
    const {id} = req.params
     OrderModel.find({userid:id}).sort({_id: -1})
     .then(result => res.status(200).json(result))
     .catch(error => res.status(400).json(error))
})

app.delete('/deleteOrders/:id', jwtHandler,(req,res,next) => {
     const {id} = req.params
     OrderModel.findByIdAndDelete({_id:id})
     .then(result => res.status(200).json({info:result,message:'Order Deleted'}))
     .catch((error) => res.status(400).json(error))
})
//@desc end of Orders Scehama


//@desc /POST/PUT/DELETE/GET of Dashboardschema

app.post('/addDashboard',(req,res,next) => {
   const {sales, orders} = req.body

   DashboardModel.create({
      sales: sales,
      orders: orders,
   })
   .then((result) => res.status(200).json(result))
   .catch((error) => res.status(400).json(error))
})
app.put('/editDashboard',jwtHandler,(req,res,next) => {
    const {sales, orders, id} = req.body
 
    DashboardModel.findByIdAndUpdate({_id: id},{
       sales: sales,
       orders: orders,
    })
    .then((result) => res.status(200).json(result))
    .catch((error) => res.status(400).json(error))
 })
 app.get('/getDashboard', jwtHandler, (req,res,next) => {
     
    DashboardModel.find()
    .then((result) => res.status(200).json(result))
    .catch((error) => res.status(400).json(error))
 })
//@desc end of Dashboard Schema
app.listen(PORT,() => {
   console.log(`Server is running on PORT:${PORT}`)
})