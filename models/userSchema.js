import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
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
    email: {type: String, unique: true},
    address: String,
    password: String,
    accesstype: String
})

UserSchema.pre('save',async function(next){
   if(this.isModified('password' || this.isNew)){
       const salt = await bcrypt.genSalt(10)
       this.password = await bcrypt.hash(this.password,salt)
   }
   next()
})

UserSchema.methods.comparePassword = async function(password){
    return bcrypt.compare(password,this.password)
}
const UserModel = mongoose.model('users',UserSchema)

export default UserModel