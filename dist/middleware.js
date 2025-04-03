"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMiddleWare = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "1df2nff2f";
// Middleware to validate user authentication
const UserMiddleWare = (req, res, next) => {
    const Header = req.headers['authorization'];
    const decode = jsonwebtoken_1.default.verify(Header, JWT_SECRET);
    if (decode) {
        //@ts-ignore
        req.userId = decode.id;
        next();
    }
    else {
        res.status(403).json({ message: 'You are not logged in' });
    }
};
exports.UserMiddleWare = UserMiddleWare;
