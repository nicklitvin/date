import { describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";

describe("error", () => {

    it("should record error", async () => {
        expect(await handler.logError("device","message")).toEqual(true);
    })

    it("should get error logs", async () => {
        expect(await handler.logError("device","message",new Date(10))).toEqual(true);
        expect(await handler.logError("device","message",new Date(20))).toEqual(true);
        expect(await handler.logError("device","message",new Date(30))).toEqual(true);
        expect(await handler.logError("device","message",new Date(40))).toEqual(true);

        const logs_1 = await handler.getErrorLogs(1, new Date(5));
        expect(logs_1.length).toEqual(0);
        
        const logs_2 = await handler.getErrorLogs(10, new Date(50));
        expect(logs_2.length).toEqual(4);
        expect(logs_2[0].timestamp.getTime()).toEqual(new Date(40).getTime());
    })

    it("should clear error log table", async () => {
        expect(await handler.logError("device","message",new Date(10))).toEqual(true);
        expect(await handler.logError("device","message",new Date(20))).toEqual(true);

        expect(await handler.clearErrorLogs()).toEqual(true);
        
        const logs = await handler.getErrorLogs(10, new Date());
        expect(logs.length).toEqual(0);
    })
})