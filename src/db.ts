import mongoose from 'mongoose';
import { model,Schema } from 'mongoose';

mongoose.connect("mongodb+srv://soumik:oPAuUHjarySd2Q9M@todo.g4qgl.mongodb.net/SecondBrain");
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const contentSchema = new mongoose.Schema({
    type: { type: String, required: true },
    link: { type: String },
    title: { type: String, required: true },
    content: { type: Array, default: [] },
    tags: { type: Array, default: [] },
    hasImage: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: { type: Date, default: Date.now }
});
const LinkSchema = new Schema({
    hash:String,
    userId: { type: mongoose.Types.ObjectId,ref:'User',required: true ,unique:true }
});

export const User = mongoose.model("User", userSchema);
export const LinkShare= mongoose.model("links", LinkSchema);

export const Content = mongoose.model("Content", contentSchema);