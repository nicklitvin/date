import { afterEach, describe, expect, it } from "@jest/globals";
import { AnnouncementInput } from "../src/interfaces";
import { handler } from "../jest.setup";

describe("announcement", () => {
    afterEach( async () => {
        Promise.all([
            handler.announcement.deleteAllAnouncements(),
            handler.announcement.deleteAnnouncementViews()
        ])
    })
    
    const funcs = handler.announcement;

    const before : AnnouncementInput = {
        startTime: new Date(0),
        endTime: new Date(10),
        message: "message",
        title: "title"
    } 

    const current : AnnouncementInput = {
        startTime: new Date(new Date().getTime() - 10**8),
        endTime: new Date(new Date().getTime() + 10**8),
        message: "message",
        title: "title"
    } 

    const after : AnnouncementInput = {
        startTime: new Date(new Date().getTime() + 10**8),
        endTime: new Date(new Date().getTime() + 10**10),
        message: "message",
        title: "title"
    } 

    it("should setup announcement constants", async () => {
        expect(before.endTime.getTime()).toBeLessThan(new Date().getTime());
        expect(current.startTime.getTime()).toBeLessThan(new Date().getTime());
        expect(current.endTime.getTime()).toBeGreaterThan(new Date().getTime());
        expect(after.startTime.getTime()).toBeGreaterThan(new Date().getTime());
    })

    it("should make announcement", async () => {
        expect(await funcs.makeAnnouncement(before)).not.toEqual(null);
        const announcements = await funcs.getAllAnnouncements();
        expect(announcements.length).toEqual(1);
    })

    it("should get current announcements", async () => {
        await Promise.all([
            funcs.makeAnnouncement(before),
            funcs.makeAnnouncement(current),
            funcs.makeAnnouncement(current),
            funcs.makeAnnouncement(after),
        ]);

        const announcements = await funcs.getCurrentAnnouncements();
        expect(announcements.length).toEqual(2);
        expect(announcements[0].startTime).toEqual(current.startTime);
        expect(announcements[1].startTime).toEqual(current.startTime);
    })

    it("should get all announcements", async () => {
        await Promise.all([
            funcs.makeAnnouncement(before),
            funcs.makeAnnouncement(current),
            funcs.makeAnnouncement(current),
            funcs.makeAnnouncement(after),
        ]);

        const announcements = await funcs.getAllAnnouncements();
        expect(announcements.length).toEqual(4);
    })

    it("should not delete nonannouncement", async () => {
        expect(await funcs.deleteAnnouncement("random_id")).toEqual(null);
    })

    it("should delete announcement", async () => {
        await Promise.all([
            funcs.makeAnnouncement(before),
            funcs.makeAnnouncement(current)
        ])

        const announcements = await funcs.getAllAnnouncements();
        expect(await funcs.deleteAnnouncement(announcements[0].id)).
            toEqual(announcements[0]);
        
        const after = await funcs.getAllAnnouncements();
        expect(after.length).toEqual(1);
    })

    it("should delete all announcements", async () => {
        const announcemnts = await Promise.all([
            funcs.makeAnnouncement(current),
            funcs.makeAnnouncement(current),
            funcs.makeAnnouncement(current),
            funcs.makeAnnouncement(current),
        ])
        expect(await funcs.deleteAllAnouncements()).toEqual(announcemnts.length);
        
        const after = await funcs.getAllAnnouncements();
        expect(after.length).toEqual(0);        
    })

    it("should view announcement", async () => {
        const [a1, a2, a3] = await Promise.all([
            funcs.makeAnnouncement(before),
            funcs.makeAnnouncement(current),
            funcs.makeAnnouncement(current),
        ])

        const userID = "a";
        expect(await funcs.getViewedAnnouncements(userID)).toHaveLength(0);

        await funcs.viewAnnouncement({
            userID: userID,
            announcementID: a2.id
        });

        expect(await funcs.getViewedAnnouncements(userID)).toHaveLength(1);
    })

    it("should delete announcement views", async () => {
        await Promise.all([
            funcs.viewAnnouncement({userID: "a", announcementID: "b"}),
            funcs.viewAnnouncement({userID: "a", announcementID: "b"}),
            funcs.viewAnnouncement({userID: "a", announcementID: "b"}),
        ]);
        expect(await funcs.deleteAnnouncementViews()).toEqual(3);
    })

    it("should delete expired entries", async () => {
        const [a1, a2, a3] = await Promise.all([
            funcs.makeAnnouncement(before),
            funcs.makeAnnouncement(current),
            funcs.makeAnnouncement(after),
        ]);

        await Promise.all([
            funcs.viewAnnouncement({userID: "a", announcementID: a1.id}),
            funcs.viewAnnouncement({userID: "a", announcementID: a2.id}),
            funcs.viewAnnouncement({userID: "a", announcementID: a3.id}),
        ])

        const output = await funcs.deleteExpiredAnnouncementsAndViews();
        expect(output.announcements).toEqual(1);
        expect(output.views).toEqual(1);
    })
})