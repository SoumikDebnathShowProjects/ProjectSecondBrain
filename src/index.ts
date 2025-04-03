import express from "express";
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Content, LinkShare, User } from "./db";
import { UserMiddleWare } from "./middleware";
import { random } from "./utils";
import { hash } from "bcrypt";
import cors from "cors";
dotenv.config();
const JWT_SECRET="1df2nff2f"
const app = express();
app.use(express.json());
app.use(cors())

// Signup Route
app.post('/api/v1/signup', async (req,res) => {
    const username =req.body.username;
    const password=req.body.password;
    try{
        await User.create({
            username:username,
            password:password
        })
        res.json({message:"You are Signed up"});
    }catch(e){
        res.status(411).json({
            message:"User already exist"
        })

    }
});
// Signin Route
app.post('/api/v1/signin', async (req,res) => {
    const username =req.body.username;
    const password=req.body.password;
    try {
        const existingUser = await User.findOne({ username,password });
         if(existingUser){
            const token = jwt.sign({ id:existingUser._id},JWT_SECRET );
        res.status(200).json({ message: "Signed in successfully", token });
         }else{
            res.status(403).json({ message: "Invalid username or password." });
         }
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// Add new content
app.post('/api/v1/content',UserMiddleWare, async (req, res) => {
    try {
        const { type, link } = req.body;
        const newContent = new Content({ 
            type, 
            link,
            tags:[],
            //@ts-ignore
            userId:req.userId });
        await newContent.save();
        res.status(200).json({ message: "Content added successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// Fetch all content
app.get('/api/v1/content',UserMiddleWare, async (req, res) => {
    try {
        //@ts-ignore
        const userId=req.userId;
        const content = await Content.find({userId}).populate("userId","username");
        res.status(200).json({ content });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// Delete content
app.delete('/api/v1/content', UserMiddleWare, async (req, res) => {
    try {
        const contentId = req.body.contentId;
     
        await Content.deleteMany({
            contentId,
               //@ts-ignore
        userId:req.userId

        })
        res.json({message:"The content is Deleted"})

        

        

    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// Create a shareable link
app.post('/api/v1/brain/share', UserMiddleWare, async (req, res) => {
    const { share} = req.body;
    //@ts-ignore
    const userId=req.userId;
    try {
        if (share) {
            const AlreadyExist= await LinkShare.findOne({userId})
            if(!AlreadyExist){
                await LinkShare.create({
                    hash:random(10),
                    //@ts-ignore
                    userId
                });
            }else{
                res.json({ message: "Shareable link created successfully" });
                res.json({hash:AlreadyExist.hash})
                return;
            }
            
        } else {
            await LinkShare.deleteOne({ userId });
           res.json({ message: "Updated shareable link" });
        }
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
app.get('/api/v1/brain/:shareLink', async (req, res) => {
    try {
        const hash= req.params.shareLink;
        const link = await  LinkShare.findOne({ hash});

        if (!link) {
          res.status(411).json({ message: "Invalid share link or sharing is disabled" });
            return;
        }else{

            
            const content=await Content.find({
                userId:link.userId
            })
            const user=await User.findOne({userId:link.userId})
            res.json({
                username: user?.username,
                content
            })


        }


    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));