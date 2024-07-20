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

const app = express()
dotenv.config()
const PORT = process.env.PORT || 3002

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(express.static('public'))
app.use(cors())


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
app.post('/addUser', (req,res,next) => {
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
app.put('/editUser',(req,res,next) => {
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
app.get('/findUser/:username',(req,res,next) => {
     const {username} = req.params
     UserModel.find({username: username})
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
app.post('/addItem',(req,res,next) => {
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

app.put('/editItem',(req,res,next) => {
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
app.delete('/deleteItem/:id/:image', (req,res,next) => {
     const {id,image} = req.params
     
     fs.unlinkSync(path.join(__dirname , 'public/images', `${image}`))

     ItemModel.findByIdAndDelete({_id: id})
     .then(result => res.status(200).json({info: result,message:'Item deleted successfully'}))
    .catch(error => res.status(400).json(error))
})

app.get('/getItem',(req,res,next) => {
     ItemModel.find().sort({_id:-1})
     .then(result => res.status(200).json(result))
     .catch(error => res.status(400).json(error))
})
app.get('/getOneItem/:id',(req,res,next) => {
    const {id} = req.params
    ItemModel.find({_id: id})
    .then(result => res.status(200).json(result))
    .catch(error => res.status(400).json(error))
})

//@desc POST/DELETE/PUT/GET For ItemSchema end of this end points


//@desc POST/DELETE/GET For CartSchema start of thins end points

app.post('/addCart', (req,res,next) => {

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

app.delete('/deleteCart/:cart', (req,res,next) => {
     const {cart} = req.params
     CartModel.findByIdAndDelete({_id:cart})
     .then(result => res.status(200).json({info:result,message:'item deleted'}))
     .catch((error) => res.status(400).json(error))
 
})

app.get('/getCarts/:id', (req,res,next) => {
    const {id} = req.params
    CartModel.find({userid:id}).sort({_id: -1})
    .then((result) => res.status(200).json(result) )
    .catch((error) => res.status(400).json(error))
})

//@desc end of Cart Schema

//@desc POST/DELETE/PUT/GET of Orders Schema

app.post('/addOrder',(req,res,next) => {
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

app.put('/editOrder',(req,res,next) => {
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
app.get('/getOrders', (req,res,next) => {
     OrderModel.find().sort({_id: -1})
     .then(result => res.status(200).json(result))
     .catch(error => res.status(400).json(error))
})

app.get('/getOrders/:id', (req,res,next) => {
    const {id} = req.params
     OrderModel.find({userid:id}).sort({_id: -1})
     .then(result => res.status(200).json(result))
     .catch(error => res.status(400).json(error))
})

app.delete('/deleteOrders/:id',(req,res,next) => {
     const {id} = req.params
     OrderModel.findByIdAndDelete({_id:id})
     .then(result => res.status(200).json({info:result,message:'Order Deleted'}))
     .catch((error) => res.status(400).json(error))
})
//@desc end of Orders Scehama
app.listen(PORT,() => {
   console.log(`Server is running on PORT:${PORT}`)
})