import mongoose from 'mongoose';
import { model,Schema } from 'mongoose';

mongoose.connect("mongodb+srv://soumik:oPAuUHjarySd2Q9M@todo.g4qgl.mongodb.net/SecondBrain");
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const contentSchema = new Schema({
    type: { type: String, required: true },
    link: { type: String, required: true },
    title: { type: String},
    tags: [{ type: mongoose.Types.ObjectId,ref:'Tag' }],
    userId: { type: mongoose.Types.ObjectId,ref:'User',required: true }
});
const LinkSchema = new Schema({
    hash:String,
    userId: { type: mongoose.Types.ObjectId,ref:'User',required: true ,unique:true }
});

export const User = mongoose.model("User", userSchema);
export const LinkShare= mongoose.model("links", LinkSchema);

export const Content = mongoose.model("Content", contentSchema);
