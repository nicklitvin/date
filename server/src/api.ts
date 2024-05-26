import express from "express";
import { URLs } from "./urls";
import { APIOutput, APIRequest, ClientIDs, ConfirmVerificationInput, DeleteImageInput, EditUserInput, GetChatInput, LoginInput, MessageInput, GetMatchesInput, NewVerificationInput, UserReportWithReportedID, SubscribeInput, SwipeInput, UnlikeInput, UpdatePushTokenInput, UploadImageInput, UserInputWithFiles, JustEmail, ReadStatusInput, GetReadStatusInput, JustUserID, UserInput, HandlerUserInput, SocketPayloadToClient, SocketPayloadToServer, UnlikeOutput, NewMatchData, ChatPreview, SwipeFeed, PublicProfile, UserSwipeStats, SubscriptionData, SettingData, Preferences, LoginOutput } from "./interfaces";
import { isAdmin, isWebCheckoutKey } from "./others";
import { Handler } from "./handler";
import expressWs from "express-ws";
import { WebSocket } from "ws";
import { Message, Swipe } from "@prisma/client";
import { errorText } from "./globals";

export class APIHandler {
    private unauthorized : APIOutput<{}> = {
        message: "Unauthorized"
    }

    constructor(app : expressWs.Application, handler : Handler) {
        app.get("/", (req,res) => res.json({message: "hi"} as APIOutput<void>));

        app.ws("/ws", (ws : WebSocket, req) => {
            try {
                const token = req.url.split("?token=")[1];
                console.log("received token",token);

                if (!token) return ws.close(1008, "Unauthorized");

                const userID = handler.socket.getUserIDFromKey(token);

                if (userID) {
                    handler.socket.addSocket({
                        socket: ws,
                        userID: userID
                    })
                    console.log("connecting socket");
                } else {
                    return ws.close(1008, "Unauthorized");
                }
            } catch (err) {
                console.log(err);
                return ws.close(1011, "Internal Server Error");
            }

            ws.on("message", async (stream : string) => {
                const returnPayload : SocketPayloadToClient = {};

                try {   
                    const data : SocketPayloadToServer = JSON.parse(stream);

                    if (data.message) {
                        const output = await handler.sendMessage(data.message);
                        if (output.data) {
                            returnPayload.payloadProcessedID = data.payloadID;
                            returnPayload.message = output.data;
                        }
                    } else if (data.readUpdate) {
                        const output = await handler.updateReadStatus(data.readUpdate);
                        if (output.data) returnPayload.payloadProcessedID = data.payloadID;
                    }
                } catch (err) {
                    console.log(err);
                    return
                } 

                ws.send(JSON.stringify(returnPayload));
            })

            ws.on("close", async (code, reason) => {
                console.log("socket terminated by user", code, reason);
            })

            ws.on("error", async (err) => {
                console.log(err);
            })
        })

        app.post(URLs.createUser, async (req, res) => {
            try {
                const body = req.body as APIRequest<UserInputWithFiles>;
                if (!body.key) return res.status(400).json();

                const user = await handler.login.getUserByKey(body.key);
                if (!user || !user.userID) return res.status(401).json(this.unauthorized);

                const input : HandlerUserInput = {
                    userID: user.userID,
                    email: user.email,
                    files: body.files,
                    ageInterest: body.ageInterest,
                    alcohol: body.alcohol,
                    attributes: body.attributes,
                    birthday: body.birthday,
                    description: body.description,
                    gender: body.gender,
                    genderInterest: body.genderInterest,
                    name: body.name,
                    smoking: body.smoking
                }
                const output = await handler.createUser(input);
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json();
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const input : MessageInput = {
                    userID: body.userID,
                    message: body.message,
                    recepientID: body.recepientID
                }
                const output = await handler.sendMessage(input);
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json();
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const input : GetChatInput = {
                    userID: body.userID,
                    fromTime: body.fromTime,
                    withID: body.withID
                }
                const output = await handler.message.getChat(input);
                return output ? 
                    res.status(200).json({data: output} as APIOutput<Message[]>) : 
                    res.status(400).json({message: errorText.cannotGetChat } as APIOutput<any>)
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const input : UserReportWithReportedID = {
                    userID: body.userID,
                    reportedID: body.reportedID
                }
                const output = await handler.reportUser(input);
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json();
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const input : GetMatchesInput = {
                    userID: body.userID,
                    timestamp: new Date(body.timestamp)
                }
                const output = await handler.getNewMatches(input);
                return output ? 
                    res.status(200).json(output as APIOutput<NewMatchData[]>) : 
                    res.status(400).json({message: errorText.cannotGetNewMatches} as APIOutput<any>)
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
                
                const input : GetMatchesInput = {
                    userID: body.userID,
                    timestamp: new Date(body.timestamp)
                }
                const output = await handler.getChatPreviews(input);
                return output ? 
                    res.status(200).json(output as APIOutput<ChatPreview[]>) : 
                    res.status(400).json({message: errorText.cannotGetChatPreviews} as APIOutput<any>)
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const input : SwipeInput = {
                    userID: body.userID,
                    action: body.action,
                    swipedUserID: body.swipedUserID
                }
                const output = await handler.makeSwipe(input);
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json(output as APIOutput<Swipe>);
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getFeed, async (req,res) => {
            try {
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();
                
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const output = await handler.getSwipeFeed(body.userID);
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json(output);
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
                if (!user || !user.userID) return res.status(401).json(this.unauthorized);
    
                const input : NewVerificationInput & JustEmail = {
                    ...body,
                    email: user.email
                }
                const output = await handler.getVerificationCode(input);
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) :
                    res.status(200).json();
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
                if (!user || !user.userID) return res.status(401).json(this.unauthorized);
    
                const input : ConfirmVerificationInput & JustEmail = {
                    email: user.email,
                    code: body.code,
                    schoolEmail: body.schoolEmail
                }
                const output = await handler.verifyUserWithCode(input);
                
                return output.message ?
                    res.status(400).json({message : errorText.cannotVerifyUser} as APIOutput<any>) :
                    res.status(200).json()
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
                if (!user || !user.userID) return res.status(401).json(this.unauthorized);
    
                const verification = await handler.verification.getVerificationByPersonalEmail(user.email);
                if (!verification) return res.status(401).json(this.unauthorized);

                const output = await handler.regenerateVerificationCode(verification.schoolEmail);
                return output ? 
                    res.status(200).json() : 
                    res.status(400).json({ message: errorText.cannotSendVerificationCode} as APIOutput<any>)
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const input : UploadImageInput = {
                    userID: body.userID,
                    image: body.image
                }
                const output = await handler.uploadImage(input);
                const publicProfile = await handler.user.getPublicProfile(body.userID)
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json({ data: publicProfile?.images } as APIOutput<any>)
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const input : DeleteImageInput = {
                    userID: body.userID,
                    imageID: body.imageID
                }
                const output = await handler.deleteImage(input);
                const publicProfile = await handler.user.getPublicProfile(body.userID)
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json({ data: publicProfile?.images } as APIOutput<any>) 
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const input : EditUserInput = {
                    userID: body.userID,
                    setting: body.setting,
                    value: body.value
                }
                const output = await handler.changeImageOrder(input);
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) :
                    res.status(200).json() 
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const input : EditUserInput = {
                    userID: body.userID,
                    setting: body.setting,
                    value: body.value,
                }
                const output = await handler.editUser(input);
                return output.message ?  
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json();
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getCheckoutPage, async (req,res) => {
            try {
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();
    
                if (!(isWebCheckoutKey(body.key) && body.userID && body.userID == body.userID)) return res.status(401).json({
                    message: "Unauthorized"
                } as APIOutput<string>);
    
                const output = await handler.getSubscriptionCheckoutPage(body.userID);
                return output.message ?
                    res.status(400).json(output as APIOutput<any>) :
                    res.status(200).json(output as APIOutput<string>) 
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.webhook, express.raw({type: 'application/json'}), async (req,res) => {
            try {
                const data = await handler.pay.extractDataFromPayment(
                    req.headers["stripe-signature"],
                    req.body
                );
                if (data) {
                    const output = await handler.processSubscriptionPay(data);
                    return output.message ? res.status(400).json(output) : res.status(200).json(); 
                } else {
                    return res.status(200).json();
                }
            } catch (err) {
                return res.status(500).json();
            }
        })

        app.post(URLs.cancelSubscription, async (req,res) => {
            try {
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const output = await handler.cancelSubscription(body.userID);
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) :
                    res.status(200).json()
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
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const output = await handler.deleteUser(body.userID);
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json()
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);

                const input : UnlikeInput = {
                    userID: body.userID,
                    withID: body.withID
                }
    
                const output = await handler.unlike(input);
                return output.message ?
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json(output as APIOutput<UnlikeOutput>)
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getProfile, async (req,res) => {
            try {
                const body = req.body as JustUserID;
    
                const output = await handler.user.getPublicProfile(body.userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput<PublicProfile>) : 
                    res.status(400).json({ message : errorText.cannotGetPublicProfile} as APIOutput<any>)
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
                if (!userID) return res.status(401).json(this.unauthorized);

                const output = await handler.user.getPublicProfile(userID);
                return output ?
                    res.status(200).json({ data: output } as APIOutput<PublicProfile>) : 
                    res.status(400).json({ message: errorText.cannotGetPublicProfile} as APIOutput<any>)

            } catch (err) {
                return res.status(500).json();
            }
        })

        app.post(URLs.getStats, async (req,res) => {
            try {
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);

                const output = await handler.getStatsIfSubscribed(body.userID);
                return output.message ?
                    res.status(400).json(output as APIOutput<any>) :  
                    res.status(200).json(output as APIOutput<UserSwipeStats>) 
                
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getSubscription, async (req,res) => {
            try {
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const output = await handler.user.getSubscriptionData(body.userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput<SubscriptionData|null>) : 
                    res.status(400).json({ message: errorText.cannotGetSubscription} as APIOutput<any>)
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getSettings, async (req,res) => {
            try {
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);

                const output = await handler.user.getSettings(body.userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput<SettingData[]|null>) : 
                    res.status(400).json({ message: errorText.cannotGetSettings } as APIOutput<any>) 
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getPreferences, async (req,res) => {
            try {
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const output = await handler.user.getPreferences(body.userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput<Preferences|null>) : 
                    res.status(400).json({ message: errorText.cannotGetPreferences } as APIOutput<any>)
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.login, async (req,res) => {
            try {
                const body = req.body as LoginInput;

                const output = await handler.loginWithToken(body);
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json(output as APIOutput<LoginOutput>)
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.autoLogin, async (req,res) => {
            try {
                const body = req.body as APIRequest<{}>;

                const output = await handler.autoLogin(body.key);
                return output.message ? 
                    res.status(400).json(output as APIOutput<any>) : 
                    res.status(200).json(output as APIOutput<LoginOutput>)
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json(this.unauthorized);
    
                const output = await handler.login.updateExpoToken(body.userID,body.expoPushToken);
                return output ? 
                    res.status(200).json() : 
                    res.status(400).json({ message: errorText.cannotUpdatePushToken } as APIOutput<any>)
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getAttributes, async (_,res) => {
            try {
                return res.status(200).json(
                    { data: await handler.attribute.getAttributes() } as APIOutput<any>
                );
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
                return res.status(200).json({data: output} as APIOutput<ClientIDs>);
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getPremiumPage, async (req, res) => {
            try {   
                const body = req.body as JustUserID;
                const url = `http://${URLs.ip}:${URLs.port + 1}/premium?userID=${body.userID}`
                return res.status(200).json({data: url} as APIOutput<string>)
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        // ADMIN-ONLY

        app.post(URLs.deleteEverything, async (req,res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();

                if (isAdmin(body.key)) {
                    await handler.deleteEverything();
                    return res.status(200).json();
                }
                return res.status(401).json(this.unauthorized);
            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.clearInteractions, async (req, res) => {
            try {
                const body = req.body as APIRequest<void>;
                if (!body.key) return res.status(400).json();

                if (isAdmin(body.key)) {
                    await Promise.all([
                        handler.swipe.deleteAllSwipes(),
                        handler.message.deleteAllMessages()
                    ])
                    return res.status(200).json();
                }
                return res.status(401).json(this.unauthorized);
                
            } catch (err) {
                console.log(err);
                return res.status(500).json(err);
            }
        })

        app.post(URLs.purchasePremium, async (req,res) => {
            try {
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();

                if (isAdmin(body.key)) {
                    await handler.processSubscriptionPay({
                        userID: body.userID,
                        subscriptionID: "random"
                    })
                    return res.status(200).json();
                }
                return res.status(401).json(this.unauthorized);
                
            } catch (err) {
                console.log(err);
                return res.status(500).json(err);
            }
        })
    }
}