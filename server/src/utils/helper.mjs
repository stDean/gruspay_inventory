import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
}

export const  comparePassword = async (password, hashedPassword) => {
  return await bcryptjs.compare(password, hashedPassword);
}

export const createJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}