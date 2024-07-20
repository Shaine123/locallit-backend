import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({ 
   itemname: String,
   price: Number,
   genre: String,
   image: String,
   description: String,
   reviewDescription: [
       {
          name: {
             type: String,
          },
          id :{
             type: String
          },
          rating: {
             type: Number
          },
          comment : [],
          date: {
             type: String
          },
          image:{
             type: String
          }
       }
   ],
   ratings: Number,
   numberOfReviews: Number

})

const ItemModel = mongoose.model('Items',ItemSchema)

export default ItemModel