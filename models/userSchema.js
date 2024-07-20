import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: String,
    userimage: {
          name: {
             type: String
          },
          url: {
             type: String
          }
    },
    firstname: String,
    lastname: String,
    phonenumber: Number,
    email: String,
    address: String,
    password: String,
    accesstype: String
})

const UserModel = mongoose.model('users',UserSchema)

export default UserModel