import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
   userid: String,
   username: String,
   itemid: String,
   itemname: String,
   itemprice: Number,
   itemquantity: Number,
   itemimage: String,
   dateadded: String
})

const CartModel = mongoose.model('Cart',CartSchema)

export default CartModel