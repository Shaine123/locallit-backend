import axios from 'axios';
import jwt from 'jsonwebtoken'
import UserModel from '../models/userSchema.js';



const jwtHandler = async (req, res, next) => {
  const JWT_SECRET = 'SHAINE'
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await UserModel.find({email:decoded.email});
    next();
  } catch (error) {
    res.status(400).send({ error: 'Invalid token.' });
  }
};


export default jwtHandler