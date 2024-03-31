import express from "express";
import { URLs } from "./urls";
import { APIRequest, ClientIDs, ConfirmVerificationInput, DeleteImageInput, EditUserInput, Email, GetChatInput, GetChatPreviewsInput, GetProfileInput, LoginInput, MessageInput, NewMatchInput, NewVerificationInput, RequestReportInput, RequestUserInput, SubscribeInput, SwipeInput, UnlikeInput, UpdatePushTokenInput, UploadImageInput } from "./interfaces";
import { Handler } from "./handler";
import { isAdmin } from "./others";
import { globals } from "./globals";

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
    
                if (!userID) return res.status(401).json();
    
                const output = await handler.getSwipeFeed(userID);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.newVerification, async (req,res) => {
            try {
                const body = req.body as APIRequest<NewVerificationInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : NewVerificationInput = {
                    ...body,
                }
                const output = await handler.getVerificationCode(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.verifyUser, async (req,res) => {
            try {
                const body = req.body as APIRequest<ConfirmVerificationInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();

                const output = await handler.verifyUserWithCode(body);
                
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.newCode, async (req,res) => {
            try {
                const body = req.body as APIRequest<Email>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const output = await handler.regenerateVerificationCode(body.email);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.uploadImage, async (req,res) => {
            try {
                const body = req.body as APIRequest<UploadImageInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : UploadImageInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.uploadImage(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.deleteImage, async (req,res) => {
            try {
                const body = req.body as APIRequest<DeleteImageInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : DeleteImageInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.deleteImage(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.newOrder, async (req,res) => {
            try {
                const body = req.body as APIRequest<EditUserInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : EditUserInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.changeImageOrder(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.editUser, async (req,res) => {
            try {
                const body = req.body as APIRequest<EditUserInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const input : EditUserInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.editUser(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.getCheckoutPage, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const output = await handler.getSubscriptionCheckoutPage(userID);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.webhook, async (req,res) => {
            try {
                const input = await handler.pay.extractDataFromPayment(
                    req.headers["Stripe-Signature"] as string,
                    req.body
                ) as SubscribeInput;
                const output = await handler.processSubscriptionPay(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.cancelSubscription, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const output = await handler.cancelSubscription(userID);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.manageSubscription, async (req,res) => {
            try {
                return res.status(200).json({
                    data: process.env.STRIPE_PAY_PORTAL
                })
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.deleteAccount, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const output = await handler.deleteUser(userID);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        }) 

        app.post(URLs.unlikeUser, async (req,res) => {
            try {
                const body = req.body as APIRequest<UnlikeInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();

                const input : UnlikeInput = {
                    ...body,
                    userID: userID
                }
    
                const output = await handler.unlike(input);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.getProfile, async (req,res) => {
            try {
                const body = req.body as GetProfileInput;
    
                const output = await handler.user.getPublicProfile(body.userID);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.getStats, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();

                const output = await handler.swipe.getUserSwipeStats(userID);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.getSubscription, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const output = await handler.user.getSubscriptionData(userID);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.getSettings, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();

                const output = await handler.user.getSettings(userID);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.getPreferences, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const output = await handler.user.getPreferences(userID);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.login, async (req,res) => {
            try {
                const body = req.body as LoginInput;

                const output = await handler.loginWithToken(body);
                return output ? res.status(200).json({
                    data: output
                }) : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.updatePushToken, async (req,res) => {
            try {
                const body = req.body as APIRequest<UpdatePushTokenInput>;
                const userID = await handler.login.getUserIDByKey(body.key);
    
                if (!userID) return res.status(401).json();
    
                const output = await handler.login.updateExpoToken(userID,body.expoPushToken);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.getAttributes, async (_,res) => {
            try {
                return res.status(200).json(await handler.attribute.getAttributes());
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.deleteEverything, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (isAdmin(body.key)) {
                    await handler.deleteEverything();
                    return res.status(200).json();
                }
                return res.status(401).json();
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.getClientIDs, async (_, res) => {
            try {
                const output : ClientIDs = {
                    android: process.env.ANDROID_CLIENT_ID,
                    ios: process.env.APPLE_CLIENT_ID,
                    expo: process.env.EXPO_CLIENT_ID
                }
                return res.status(200).json(output);
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })

        app.post(URLs.createSample, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (isAdmin(body.key)) {
                    await handler.createSample()
                    res.status(200).json();
                }
                return res.status(401).json();
            } catch (err) {
                console.log(err);
                res.status(500).json();
            }
        })
    }
}