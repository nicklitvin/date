import { describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { Announcement } from "@prisma/client";

describe("anouncement", () => {
    const before : Announcement = {
        id: "before",
        startTime: new Date(0),
        endTime: new Date(10),
        message: "message",
        title: "title"
    } 

    const current : Announcement = {
        id: "current_1",
        startTime: new Date(new Date().getTime() - 10**8),
        endTime: new Date(new Date().getTime() + 10**8),
        message: "message",
        title: "title"
    } 

    const after : Announcement = {
        id: "after",
        startTime: new Date(new Date().getTime() + 10**8),
        endTime: new Date(new Date().getTime() + 10**10),
        message: "message",
        title: "title"
    } 

    it("should make announcement", async () => {
        expect(await handler.makeAnnouncement(before)).toEqual(true);

        const announcements = await handler.getAllAnnouncements();
        expect(announcements.length).toEqual(1);
        expect(announcements[0].id !== before.id).toEqual(true);
    })

    it("should get current announcements", async () => {
        expect(await handler.makeAnnouncement(before)).toEqual(true);
        expect(await handler.makeAnnouncement(current)).toEqual(true);
        expect(await handler.makeAnnouncement(current)).toEqual(true);
        expect(await handler.makeAnnouncement(after)).toEqual(true);

        const announcemts = await handler.getAnnouncements();
        expect(announcemts.length).toEqual(2);
        expect(announcemts[0].startTime).toEqual(current.startTime);
        expect(announcemts[1].startTime).toEqual(current.startTime);
    })

    it("should delete nonannouncement", async () => {
        expect(await handler.deleteAnnouncement("random")).toEqual(true);
    })

    it("should delete announcement", async () => {
        expect(await handler.makeAnnouncement(before)).toEqual(true);
        expect(await handler.makeAnnouncement(current)).toEqual(true);
        const pre = await handler.getAllAnnouncements();
        expect(pre.length).toEqual(2);

        expect(await handler.deleteAnnouncement(pre[0].id)).toEqual(true);
        const after = await handler.getAllAnnouncements();
        expect(after.length).toEqual(1);
        expect(after[0].startTime).toEqual(current.startTime);
    })

    it("should delete all anouncements", async () => {
        expect(await handler.makeAnnouncement(before)).toEqual(true);
        expect(await handler.makeAnnouncement(current)).toEqual(true);
        
        const pre = await handler.getAllAnnouncements();
        expect(pre.length).toEqual(2);

        expect(await handler.deleteAllAnouncement()).toEqual(true);
        const after = await handler.getAllAnnouncements();
        expect(after.length).toEqual(0);
    })
})