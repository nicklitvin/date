import express from "express";
import { URLs } from "./urls";
import { APIOutput, APIRequest, ClientIDs, ConfirmVerificationInput, DeleteImageInput, EditUserInput, GetChatInput, GetProfileInput,LoginInput, MessageInput, GetMatchesInput, NewVerificationInput, UserReportWithReportedID, SubscribeInput, SwipeInput, UnlikeInput, UpdatePushTokenInput, UploadImageInput, UserInputWithFiles, WithEmail, ReadStatusInput } from "./interfaces";
import { isAdmin } from "./others";
import { Handler } from "./handler";

export class APIHandler {
    constructor(app : express.Application, handler : Handler) {

        app.get("/", (req,res) => res.json("hi"));

        app.post(URLs.createUser, async (req, res) => {
            try {
                const body = req.body as APIRequest<UserInputWithFiles>;
                if (!body.key) return res.status(400).json();

                const user = await handler.login.getUserByKey(body.key);
                if (!user || !user.userID) return res.status(401).json();

                const input : UserInputWithFiles & WithEmail = {
                    ...body,
                    id: user.userID,
                    email: user.email,
                    files: body.files
                }
                const output = await handler.createUser(input);
                return output ? res.status(200).json() : res.status(400).json();
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })
    
        app.post(URLs.sendMessage, async (req,res) => {
            try {
                const body = req.body as APIRequest<MessageInput>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const input : MessageInput = {
                    userID: userID,
                    message: body.message,
                    recepientID: body.recepientID
                }
                const output = await handler.sendMessage(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })
    
        app.post(URLs.getChat, async (req,res) => {
            try {
                const body = req.body as APIRequest<GetChatInput>;
                if (!body.key) return res.status(400).json();
                
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const input : GetChatInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.message.getChat(input);
                return output ? 
                    res.status(200).json({data: output} as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.reportUser, async (req,res) => {
            try {
                const body = req.body as APIRequest<UserReportWithReportedID>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const input : UserReportWithReportedID = {
                    userID: userID,
                    reportedID: body.reportedID
                }
                const output = await handler.reportUser(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getNewMatches, async (req,res) => {
            try {
                const body = req.body as APIRequest<GetMatchesInput>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const input : GetMatchesInput = {
                    userID: userID,
                    timestamp: new Date(body.timestamp)
                }
                const output = await handler.getNewMatches(input);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getNewChatPreviews, async (req,res) => {
            try {
                const body = req.body as APIRequest<GetMatchesInput>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
                
                const input : GetMatchesInput = {
                    userID: userID,
                    timestamp: new Date(body.timestamp)
                }
                const output = await handler.getChatPreviews(input);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.makeSwipe, async (req,res) => {
            try {
                const body = req.body as APIRequest<SwipeInput>;
                if (!body.key) return res.status(400).json();
                
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const input : SwipeInput = {
                    userID: userID,
                    action: body.action,
                    swipedUserID: body.swipedUserID
                }
                const output = await handler.makeSwipe(input);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getFeed, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();
                
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const output = await handler.getSwipeFeed(userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.newVerification, async (req,res) => {
            try {
                const body = req.body as APIRequest<NewVerificationInput>;
                if (!body.key) return res.status(400).json();
    
                const user = await handler.login.getUserByKey(body.key);
                if (!user || !user.userID) return res.status(401).json();
    
                const input : NewVerificationInput & WithEmail = {
                    ...body,
                    email: user.email
                }
                const output = await handler.getVerificationCode(input);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.verifyUser, async (req,res) => {
            try {
                const body = req.body as APIRequest<ConfirmVerificationInput>;
                if (!body.key) return res.status(400).json();
    
                const user = await handler.login.getUserByKey(body.key);
                if (!user || !user.userID) return res.status(401).json();
    
                const input : ConfirmVerificationInput & WithEmail = {
                    ...body,
                    email: user.email
                }
                const output = await handler.verifyUserWithCode(input);
                
                return output ? 
                    res.status(200).json() : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.newCode, async (req,res) => {
            try {
                const body = req.body as APIRequest<{}>;
                if (!body.key) return res.status(400).json();
    
                const user = await handler.login.getUserByKey(body.key);
                if (!user || !user.userID) return res.status(401).json();
    
                const verification = await handler.verification.getVerificationByPersonalEmail(user.email);
                if (!verification) return res.status(401).json();

                const output = await handler.regenerateVerificationCode(verification.schoolEmail);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.uploadImage, async (req,res) => {
            try {
                const body = req.body as APIRequest<UploadImageInput>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const input : UploadImageInput = {
                    userID: userID,
                    image: body.image
                }
                const output = await handler.uploadImage(input);
                const publicProfile = await handler.user.getPublicProfile(userID)
                return output ? 
                    res.status(200).json({ data: publicProfile?.images }) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.deleteImage, async (req,res) => {
            try {
                const body = req.body as APIRequest<DeleteImageInput>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const input : DeleteImageInput = {
                    ...body,
                    userID: userID
                }
                const output = await handler.deleteImage(input);
                const publicProfile = await handler.user.getPublicProfile(userID)
                return output ? 
                    res.status(200).json({ data: publicProfile?.images }) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.newOrder, async (req,res) => {
            try {
                const body = req.body as APIRequest<EditUserInput>;
                if (!body.key) return res.status(400).json();
    
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
                return res.status(500).json();
            }
        })

        app.post(URLs.editUser, async (req,res) => {
            try {
                const body = req.body as APIRequest<EditUserInput>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const input : EditUserInput = {
                    userID: userID,
                    setting: body.setting,
                    value: body.value,
                }
                const output = await handler.editUser(input);
                return output ?  res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getCheckoutPage, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const output = await handler.getSubscriptionCheckoutPage(userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
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
                return res.status(500).json();
            }
        })

        app.post(URLs.cancelSubscription, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const output = await handler.cancelSubscription(userID);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.manageSubscription, async (req,res) => {
            try {
                return res.status(200).json({
                    data: process.env.STRIPE_PAY_PORTAL
                })
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.deleteAccount, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const output = await handler.deleteUser(userID);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        }) 

        app.post(URLs.unlikeUser, async (req,res) => {
            try {
                const body = req.body as APIRequest<UnlikeInput>;
                if (!body.key) return res.status(400).json();
                
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();

                const input : UnlikeInput = {
                    ...body,
                    userID: userID
                }
    
                const output = await handler.unlike(input);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getProfile, async (req,res) => {
            try {
                const body = req.body as GetProfileInput;
    
                const output = await handler.user.getPublicProfile(body.userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getMyProfile, async (req,res) => {
            try {
                const body : APIRequest<{}> = req.body;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();

                const output = await handler.user.getPublicProfile(userID);
                return output ?
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()

            } catch (err) {
                return res.status(500).json();
            }
        })

        app.post(URLs.getStats, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();

                const output = await handler.getStatsIfSubscribed(userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
                
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getSubscription, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const output = await handler.user.getSubscriptionData(userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getSettings, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();

                const output = await handler.user.getSettings(userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getPreferences, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const output = await handler.user.getPreferences(userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.login, async (req,res) => {
            try {
                const body = req.body as LoginInput;

                const output = await handler.loginWithToken(body);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput) : 
                    res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.updatePushToken, async (req,res) => {
            try {
                const body = req.body as APIRequest<UpdatePushTokenInput>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();
    
                const output = await handler.login.updateExpoToken(userID,body.expoPushToken);
                return output ? res.status(200).json() : res.status(400).json()
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getAttributes, async (_,res) => {
            try {
                return res.status(200).json(
                    { data: await handler.attribute.getAttributes() } as APIOutput
                );
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.deleteEverything, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();

                if (isAdmin(body.key)) {
                    await handler.deleteEverything();
                    return res.status(200).json();
                }
                return res.status(401).json();
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getClientIDs, async (_, res) => {
            try {
                const output : ClientIDs = {
                    android: process.env.ANDROID_CLIENT_ID,
                    ios: process.env.APPLE_CLIENT_ID,
                    expo: process.env.EXPO_CLIENT_ID
                }
                return res.status(200).json({data: output} as APIOutput);
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.createSample, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();

                if (isAdmin(body.key)) {
                    await handler.createSample()
                    return res.status(200).json();
                }
                return res.status(401).json();
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.sendReadStatus, async (req,res) => {
            try {
                const body = req.body as APIRequest<ReadStatusInput>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!userID) return res.status(401).json();

                const output = await handler.updateReadStatus({
                    timestamp: new Date(body.timestamp),
                    userID: userID,
                    toID: body.toID
                })
    
                // const output = await handler.login.updateExpoToken(userID,body.expoPushToken);
                return output ? res.status(200).json() : res.status(400).json()

            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })
    }
}