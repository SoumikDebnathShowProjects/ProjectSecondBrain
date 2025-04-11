import express from "express";
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Content, LinkShare, User } from "./db";
import { UserMiddleWare } from "./middleware";
import { random } from "./utils";
// Use bcryptjs instead
import bcrypt from 'bcryptjs';
 // ✅ Uncomment this line

import cors from "cors";


dotenv.config();
const JWT_SECRET="1df2nff2f"
const app = express();

app.use(express.json({ strict: false }));


app.use(cors())
app.use(express.json());
// Signup Route
app.post('/api/v1/signup', async (req,res) => {
    const username =req.body.username;
    const password=req.body.password;
    const hashedPassword=await bcrypt.hash(password,10);
    try{
        await User.create({
            username:username,
            password:hashedPassword
        })
        res.json({message:"You are Signed up"});
    }catch(e){
        res.status(411).json({
            message:"User already exist"
        })

    }
});
// Signin Route
app.post('/api/v1/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
           res.status(403).json({ message: "Invalid username or password." });
           return;
        }

        // ✅ Compare password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign({ id: user._id }, JWT_SECRET);
            res.status(200).json({ message: "Signed in successfully", token });
        } else {
             res.status(403).json({ message: "Invalid username or password." });
        }
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Add new content
app.post('/api/v1/content', UserMiddleWare, async (req, res) => {
    try {
        const { type, link, title, content, tags, hasImage } = req.body;

        const newContent = new Content({ 
            type, 
            link, 
            title, 
            content: content || [],
            tags: tags || [], 
            hasImage: hasImage || false,
            //@ts-ignore
            userId: req.userId,
            date: new Date()
        });

        await newContent.save();
        res.status(200).json({ message: "Content added successfully", content: newContent });
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
        res.status(200).json(content); 
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// Delete content
app.delete('/api/v1/content/:id', UserMiddleWare, async (req, res) => {
    try {
        const contentId = req.params.id;
        // @ts-ignore - Assuming userId is added by UserMiddleWare
        const userId = req.userId; 

        const deletionResult = await Content.deleteOne({
            _id: contentId,
            userId: userId // Ensure user can only delete their own content
        });

        if (deletionResult.deletedCount === 0) {
            res.status(404).json({ 
                message: "Content not found or you don't have permission to delete it" 
            });
        }

        res.json({ 
            success: true,
            message: "Content deleted successfully",
            deletedId: contentId
        });

    } catch (error: any) {
        console.error('Delete content error:', error);
        res.status(500).json({ 
            success: false,
            message: "Server error while deleting content",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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