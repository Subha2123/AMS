import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config()

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/api/auth/login')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;

    next();
  } catch (error) {
    console.log(
        "Error while validate token",error.message
    );
    res.redirect('/api/auth/login')
  }
};
