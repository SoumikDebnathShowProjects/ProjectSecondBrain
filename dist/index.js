"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import bcrypt from 'bcrypt';
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const JWT_SECRET = "1df2nff2f";
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Signup Route
app.post('/api/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    try {
        yield db_1.User.create({
            username: username,
            password: password
        });
        res.json({ message: "You are Signed up" });
    }
    catch (e) {
        res.status(411).json({
            message: "User already exist"
        });
    }
}));
// Signin Route
app.post('/api/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const existingUser = yield db_1.User.findOne({ username, password });
        if (existingUser) {
            const token = jsonwebtoken_1.default.sign({ id: existingUser._id }, JWT_SECRET);
            res.status(200).json({ message: "Signed in successfully", token });
        }
        else {
            res.status(403).json({ message: "Invalid username or password." });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}));
// Add new content
app.post('/api/v1/content', middleware_1.UserMiddleWare, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, link } = req.body;
        const newContent = new db_1.Content({
            type,
            link,
            tags: [],
            //@ts-ignore
            userId: req.userId
        });
        yield newContent.save();
        res.status(200).json({ message: "Content added successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}));
// Fetch all content
app.get('/api/v1/content', middleware_1.UserMiddleWare, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const content = yield db_1.Content.find({ userId }).populate("userId", "username");
        res.status(200).json({ content });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}));
// Delete content
app.delete('/api/v1/content', middleware_1.UserMiddleWare, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contentId = req.body.contentId;
        yield db_1.Content.deleteMany({
            contentId,
            //@ts-ignore
            userId: req.userId
        });
        res.json({ message: "The content is Deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}));
// Create a shareable link
app.post('/api/v1/brain/share', middleware_1.UserMiddleWare, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    //@ts-ignore
    const userId = req.userId;
    try {
        if (share) {
            const AlreadyExist = yield db_1.LinkShare.findOne({ userId });
            if (!AlreadyExist) {
                yield db_1.LinkShare.create({
                    hash: (0, utils_1.random)(10),
                    //@ts-ignore
                    userId
                });
            }
            else {
                res.json({ message: "Shareable link created successfully" });
                res.json({ hash: AlreadyExist.hash });
                return;
            }
        }
        else {
            yield db_1.LinkShare.deleteOne({ userId });
            res.json({ message: "Updated shareable link" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}));
app.get('/api/v1/brain/:shareLink', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hash = req.params.shareLink;
        const link = yield db_1.LinkShare.findOne({ hash });
        if (!link) {
            res.status(411).json({ message: "Invalid share link or sharing is disabled" });
            return;
        }
        else {
            const content = yield db_1.Content.find({
                userId: link.userId
            });
            const user = yield db_1.User.findOne({ userId: link.userId });
            res.json({
                username: user === null || user === void 0 ? void 0 : user.username,
                content
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
