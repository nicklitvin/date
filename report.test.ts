// import { describe, expect, it } from "@jest/globals";
// import { createSampleChatLog, createTwoUsersInSameUni, defaults, handler, prismaManager } from "./server/jest.setup";

// describe("report", () => {
//     it("should not report if nonuser", async () => {
//         await createTwoUsersInSameUni();
//         expect(await handler.reportUser(defaults.userID, defaults.userID_3)).toEqual(false);
//     })

//     it("should not report nonuser", async () => {
//         await createTwoUsersInSameUni();
//         expect(await handler.reportUser(defaults.userID_3, defaults.userID)).toEqual(false);
//     })

//     it("should report user", async () => {
//         await createTwoUsersInSameUni();
//         expect(await handler.reportUser(defaults.userID, defaults.userID_2)).toEqual(true);
//         expect(await prismaManager.getReportCount(defaults.calEmail_2)).toEqual(1);
//     })

//     it("should not delete report if user deletes", async () => {
//         await createTwoUsersInSameUni();
//         expect(await handler.reportUser(defaults.userID, defaults.userID_2)).toEqual(true);
//         await handler.deleteUser(defaults.userID_2);
//         expect(await prismaManager.getReportCount(defaults.calEmail_2)).toEqual(1);
//         await handler.deleteUser(defaults.userID);
//         expect(await prismaManager.getReportCount(defaults.calEmail_2)).toEqual(1);
//     })

//     it("should not show reported user in swipe feed", async () => {
//         await createTwoUsersInSameUni();
//         expect(await handler.reportUser(defaults.userID, defaults.userID_2)).toEqual(true);
//         const swipeFeed = await handler.getSwipeFeed(defaults.userID);
//         expect(swipeFeed.feed.length).toEqual(0);
//     })

//     it("should delete messages if report", async () => {
//         const chatLength = 5;
//         await createTwoUsersInSameUni();
//         await createSampleChatLog(defaults.userID, defaults.userID_2,0,chatLength);

//         const chatLog = await prismaManager.getChatLog(defaults.userID, defaults.userID_2);
//         expect(chatLog.length).toEqual(chatLength);

//         expect(await handler.reportUser(defaults.userID, defaults.userID_2)).toEqual(true);
//         const chatLog_2 = await prismaManager.getChatLog(defaults.userID, defaults.userID_2);
//         expect(chatLog_2.length).toEqual(0);
//     })

//     it("should not report same user twice", async () => {
//         await createTwoUsersInSameUni();
//         expect(await handler.reportUser(defaults.userID, defaults.userID_2)).toEqual(true);
//         expect(await handler.reportUser(defaults.userID, defaults.userID_2)).toEqual(false);
//     })

//     it("should delete user if enough reports", async () => {
//         await createTwoUsersInSameUni();
//         expect(await handler.reportUser(defaults.userID, defaults.userID_2,1)).toEqual(true);
//         expect(await prismaManager.getReportCount(defaults.calEmail_2)).toEqual(1);
//         expect(await prismaManager.getUserCount(defaults.userID_2)).toEqual(0);
//     })
// })