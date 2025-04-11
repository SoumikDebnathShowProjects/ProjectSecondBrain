import { Request, Response, NextFunction } from "express";
import jwt, { decode } from 'jsonwebtoken'
const JWT_SECRET="1df2nff2f"
// Middleware to validate user authentication
export const UserMiddleWare = (req: Request, res: Response, next: NextFunction) => {
  const Header = req.headers['authorization'];

  const decode=jwt.verify(Header as string,JWT_SECRET);
    if(decode){
        //@ts-ignore
        req.userId=decode.id
        next();
    }else{
        res.status(403).json({message:'You are not logged in'})
    }

};
