import express from "express";
import { URLs } from "./urls";
import { APIRequest, ConfirmVerificationInput, DeleteImageInput, Email, GetChatInput, GetChatPreviewsInput, MessageInput, NewMatchInput, NewVerificationInput, RequestReportInput, RequestUserInput, SwipeInput, UploadImageInput } from "./interfaces";
import { Handler } from "./handler";

export class APIHandler {
    constructor(app : express.Application, handler : Handler) {

        app.get("/", (req,res) => res.json("hi"));

        app.post(URLs.createUser, async (req, res) => {
            try {
                const body = req.body as APIRequest<RequestUserInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : RequestUserInput = {
                    ...body,
                    id: userID!
                }
                const output = await handler.createUser(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })
    
        app.post(URLs.sendMessage, async (req,res) => {
            try {
                const body = req.body as APIRequest<MessageInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : MessageInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.sendMessage(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })
    
        app.post(URLs.getChat, async (req,res) => {
            try {
                const body = req.body as APIRequest<GetChatInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : GetChatInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.message.getChat(input);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.reportUser, async (req,res) => {
            try {
                const body = req.body as APIRequest<RequestReportInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : RequestReportInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.reportUser(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.getNewMatches, async (req,res) => {
            try {
                const body = req.body as APIRequest<NewMatchInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : NewMatchInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.getNewMatches(input);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.getNewChatPreviews, async (req,res) => {
            try {
                const body = req.body as APIRequest<GetChatPreviewsInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : GetChatPreviewsInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.getChatPreviews(input);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.makeSwipe, async (req,res) => {
            try {
                const body = req.body as APIRequest<SwipeInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : SwipeInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.makeSwipe(input);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.getFeed, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).send();
    
                const output = await handler.getSwipeFeed(userID);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).send();
            }
        })

        app.post(URLs.newVerification, async (req,res) => {
            try {
                const body = req.body as APIRequest<NewVerificationInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).send();
    
                const input : NewVerificationInput = {
                    ...body,
                }
                const output = await handler.getVerificationCode(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).send();
            }
        })

        app.post(URLs.verifyUser, async (req,res) => {
            try {
                const body = req.body as APIRequest<ConfirmVerificationInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).send();
    
                const input : ConfirmVerificationInput = {
                    ...body,
                }
                const output = await handler.verifyUserWithCode(input);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).send();
            }
        })

        app.post(URLs.newCode, async (req,res) => {
            try {
                const body = req.body as APIRequest<Email>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).send();
    
                const output = await handler.regenerateVerificationCode(body.email);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).send();
            }
        })

        app.post(URLs.uploadImage, async (req,res) => {
            try {
                const body = req.body as APIRequest<UploadImageInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).send();
    
                const input : UploadImageInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.uploadImage(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).send();
            }
        })

        app.post(URLs.deleteImage, async (req,res) => {
            try {
                const body = req.body as APIRequest<DeleteImageInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).send();
    
                const input : DeleteImageInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.deleteImage(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).send();
            }
        })
    }
}