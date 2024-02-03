import { afterEach, describe, expect, it } from "@jest/globals";
import { AnnouncementInput } from "../src/interfaces";
import { handler } from "../jest.setup";

afterEach( async () => {
    await handler.announcement.deleteAllAnouncements()
})

describe("announcement", () => {
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
})