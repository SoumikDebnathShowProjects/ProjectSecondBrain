"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Content = exports.LinkShare = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
mongoose_1.default.connect("mongodb+srv://soumik:oPAuUHjarySd2Q9M@todo.g4qgl.mongodb.net/SecondBrain");
const userSchema = new mongoose_2.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const contentSchema = new mongoose_1.default.Schema({
    type: { type: String, required: true },
    link: { type: String },
    title: { type: String, required: true },
    content: { type: Array, default: [] },
    tags: { type: Array, default: [] },
    hasImage: { type: Boolean, default: false },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    date: { type: Date, default: Date.now }
});
const LinkSchema = new mongoose_2.Schema({
    hash: String,
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'User', required: true, unique: true }
});
exports.User = mongoose_1.default.model("User", userSchema);
exports.LinkShare = mongoose_1.default.model("links", LinkSchema);
exports.Content = mongoose_1.default.model("Content", contentSchema);
