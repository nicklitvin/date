import express from "express";
import { URLs } from "./urls";
import { APIOutput, APIRequest, ClientIDs, ConfirmVerificationInput, DeleteImageInput, EditUserInput, GetChatInput, LoginInput, MessageInput, GetMatchesInput, NewVerificationInput, UserReportWithReportedID, SubscribeInput, SwipeInput, UnlikeInput, UpdatePushTokenInput, UploadImageInput, UserInputWithFiles, JustEmail, ReadStatusInput, GetReadStatusInput, JustUserID, UserInput, HandlerUserInput, SocketPayloadToClient, SocketPayloadToServer, UnlikeOutput, NewMatchData, ChatPreview, SwipeFeed, PublicProfile, UserSwipeStats, SubscriptionData, SettingData, Preferences, LoginOutput } from "./interfaces";
import { isAdmin } from "./others";
import { Handler } from "./handler";
import expressWs from "express-ws";
import { WebSocket } from "ws";
import { Message, Swipe } from "@prisma/client";

export class APIHandler {
    constructor(app : expressWs.Application, handler : Handler) {

        app.get("/", (req,res) => res.json({message: "hi"} as APIOutput<void>));

        app.ws("/ws", (ws : WebSocket, req) => {
            try {
                const token = req.url.split("?token=")[1];
                console.log(token);

                if (!token) return ws.close(401);

                const userID = handler.socket.getUserIDFromKey(token);

                if (userID) {
                    handler.socket.addSocket({
                        socket: ws,
                        userID: userID
                    })
                    console.log("added socket");
                } else {
                    return ws.close(401);
                }
            } catch (err) {
                console.log(err);
                return ws.close(500);
            }

            ws.on("message", async (stream : string) => {
                const returnPayload : SocketPayloadToClient = {
                    inputProcessed: false
                };

                try {   
                    const data : SocketPayloadToServer = JSON.parse(stream);
                    if (data.message) {
                        const output = await handler.sendMessage(data.message);
                        returnPayload.inputProcessed = output.data != null;
                    } else if (data.readUpdate) {
                        const output = await handler.updateReadStatus(data.readUpdate);
                        returnPayload.inputProcessed == output.data != null;
                    }
                } catch (err) {
                    console.log(err);
                    return
                } 

                ws.send(JSON.stringify(returnPayload));
            })
        })

        app.post(URLs.createUser, async (req, res) => {
            try {
                const body = req.body as APIRequest<UserInputWithFiles>;
                if (!body.key) return res.status(400).json();

                const user = await handler.login.getUserByKey(body.key);
                if (!user || !user.userID) return res.status(401).json();

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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const input : MessageInput = {
                    userID: body.userID,
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const input : GetChatInput = {
                    userID: body.userID,
                    fromTime: body.fromTime,
                    withID: body.withID
                }
                const output = await handler.message.getChat(input);
                return output ? 
                    res.status(200).json({data: output} as APIOutput<Message[]>) : 
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const input : UserReportWithReportedID = {
                    userID: body.userID,
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const input : GetMatchesInput = {
                    userID: body.userID,
                    timestamp: new Date(body.timestamp)
                }
                const output = await handler.getNewMatches(input);
                return output ? 
                    res.status(200).json(output as APIOutput<NewMatchData[]>) : 
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
                
                const input : GetMatchesInput = {
                    userID: body.userID,
                    timestamp: new Date(body.timestamp)
                }
                const output = await handler.getChatPreviews(input);
                return output ? 
                    res.status(200).json(output as APIOutput<ChatPreview[]>) : 
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const input : SwipeInput = {
                    userID: body.userID,
                    action: body.action,
                    swipedUserID: body.swipedUserID
                }
                const output = await handler.makeSwipe(input);
                return output ? 
                    res.status(200).json(output as APIOutput<Swipe>) : 
                    res.status(400).json()
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const output = await handler.getSwipeFeed(body.userID);
                return output ? 
                    res.status(200).json(output as APIOutput<SwipeFeed>) : 
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
    
                const input : NewVerificationInput & JustEmail = {
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
    
                const input : ConfirmVerificationInput & JustEmail = {
                    email: user.email,
                    code: body.code,
                    schoolEmail: body.schoolEmail
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const input : UploadImageInput = {
                    userID: body.userID,
                    image: body.image
                }
                const output = await handler.uploadImage(input);
                const publicProfile = await handler.user.getPublicProfile(body.userID)
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const input : DeleteImageInput = {
                    userID: body.userID,
                    imageID: body.imageID
                }
                const output = await handler.deleteImage(input);
                const publicProfile = await handler.user.getPublicProfile(body.userID)
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const input : EditUserInput = {
                    userID: body.userID,
                    setting: body.setting,
                    value: body.value
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const input : EditUserInput = {
                    userID: body.userID,
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
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();
    
                if (!(isAdmin(body.key) || body.userID || body.userID == body.userID)) return res.status(401).json();
    
                const output = await handler.getSubscriptionCheckoutPage(body.userID);
                return output ? 
                    res.status(200).json(output as APIOutput<string>) : 
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
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const output = await handler.cancelSubscription(body.userID);
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
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();
    
                const userID = await handler.login.getUserIDByKey(body.key);
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const output = await handler.deleteUser(body.userID);
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();

                const input : UnlikeInput = {
                    userID: body.userID,
                    withID: body.withID
                }
    
                const output = await handler.unlike(input);
                return output ? 
                    res.status(200).json(output as APIOutput<UnlikeOutput>) : 
                    res.status(400).json()
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
                    res.status(200).json({ data: output } as APIOutput<PublicProfile>) : 
                    res.status(400).json()

            } catch (err) {
                return res.status(500).json();
            }
        })

        app.post(URLs.getStats, async (req,res) => {
            try {
                const body = req.body as APIRequest<JustUserID>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();

                const output = await handler.getStatsIfSubscribed(body.userID);
                return output ? 
                    res.status(200).json(output as APIOutput<UserSwipeStats>) : 
                    res.status(400).json()
                
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const output = await handler.user.getSubscriptionData(body.userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput<SubscriptionData|null>) : 
                    res.status(400).json()
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();

                const output = await handler.user.getSettings(body.userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput<SettingData[]|null>) : 
                    res.status(400).json()
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const output = await handler.user.getPreferences(body.userID);
                return output ? 
                    res.status(200).json({ data: output } as APIOutput<Preferences|null>) : 
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
                    res.status(200).json(output as APIOutput<LoginOutput>) : 
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();
    
                const output = await handler.login.updateExpoToken(body.userID,body.expoPushToken);
                return output ? res.status(200).json() : res.status(400).json()
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
                return res.status(200).json({data: output} as APIOutput<ClientIDs>);
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
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();

                const output = await handler.updateReadStatus({
                    timestamp: new Date(body.timestamp),
                    userID: body.userID,
                    toID: body.toID
                })
    
                return output != null ? res.status(200).json() : res.status(400).json()

            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })

        app.post(URLs.getReadStatus, async (req,res) => {
            try {
                const body = req.body as APIRequest<GetReadStatusInput>;
                if (!body.key) return res.status(400).json();

                const userID = await handler.login.getUserIDByKey(body.key);
                if (!(isAdmin(body.key) || userID || userID == body.userID)) return res.status(401).json();

                const output = await handler.getReadStatus({
                    userID: body.userID,
                    readerID: body.readerID
                })
    
                return output ? 
                    res.status(200).json({ data: output }) : 
                    res.status(400).json()

            } catch (err) {
                console.log(err);
                return res.status(500).json();
            }
        })
    }
}