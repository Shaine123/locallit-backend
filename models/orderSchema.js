import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
   userid: String,
   orders: [
     { 
        productid: {
           type: String
        },
        productimage: {
          type: String
       },
       productname: {
        type: String
       },
       productprice: {
        type: Number
       },
       productquantity: {
        type: Number
       },
       dateadded: {
        type: String
       },   
     }
   ],
   dateordered: String,
   datedelivered:String,
   deliverypackage: String,
   deliverystatus: String,
   timeinterval: Number,
   ordertotal: Number,
   userinfo: {
            firstname: { 
               type: String
            },
            lastname: {
               type: String
            },
            address: {
               type: String
            },
            phonenumber: {
               type: String
            },
            postalcode: {
               type: Number
            },
            city: {
               type: String
            }
        }
        
})

const OrderModel = mongoose.model('orders',orderSchema)

export default OrderModel