// import { describe, expect, it } from "@jest/globals";
// import { createSampleUser, createTwoUsersInSameUni, defaults, handler, prismaManager } from "./server/jest.setup";
// import { UserStats } from "./server/src/types";
// import { startOfWeek, subWeeks } from "date-fns";

// describe("stats", () => {
//     it("should not get stats from nonuser", async () => {
//         expect(await handler.getUserStats(defaults.userID)).toEqual(null);
//     })

//     it("should get stats", async () => {
//         await createTwoUsersInSameUni();

//         expect(await handler.makeSwipe(defaults.userID, defaults.userID_2, "Like")).toEqual(true);
//         expect(await handler.makeSwipe(defaults.userID_2, defaults.userID, "Dislike")).toEqual(true);

//         const stats = await handler.getUserStats(defaults.userID) as UserStats;
//         expect(stats.allTime.dislikedMe).toEqual(1);
//         expect(stats.allTime.likedMe).toEqual(0);
//         expect(stats.allTime.myLikes).toEqual(1);
//         expect(stats.allTime.myDislikes).toEqual(0);
//         expect(stats.weekly.length).toEqual(4);
//         expect(stats.weekly[0].weeksAgo).toEqual(0);
//         expect(stats.weekly[0].myLikes).toEqual(1);
//         expect(stats.weekly[0].dislikedMe).toEqual(1);
//         expect(stats.weekly[1].weeksAgo).toEqual(1);
//         expect(stats.weekly[1].myLikes).toEqual(0);
//         expect(stats.weekly[1].dislikedMe).toEqual(0);
//     })

//     it("should keeps weeks separated", async () => {
//         await createTwoUsersInSameUni();

//         const weekStart0 = startOfWeek(new Date());
//         const weekStart2 = subWeeks(weekStart0, 2);

//         expect(await prismaManager.createSwipe(defaults.userID, defaults.userID_2,"Like", new Date(0)));
//         expect(await prismaManager.createSwipe(defaults.userID, defaults.userID_2,"Like", new Date(
//             weekStart2.getTime() - 10
//         )))

//         const stats = await handler.getUserStats(defaults.userID) as UserStats;
//         expect(stats.allTime.myLikes).toEqual(2);  
//         expect(stats.weekly.reduce( (prev,current) =>  prev + current.myLikes, 0)).toEqual(1);
//     })
// })