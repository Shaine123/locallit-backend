import mongoose from "mongoose";

const dashBoardSchema = new mongoose.Schema({
    sales: [
      {
        name: {
           type:String
        },
        index: {
           type: Number
        },
        amount: {
           type: Number
        }
      }
    ],
    orders: [
      {
        name: {
           type:String
        },
        index: {
           type: Number
        },
        amount: {
           type: Number
        }
      }
    ]
})

const DashboardModel = mongoose.model('dashboard',dashBoardSchema)

export default DashboardModel