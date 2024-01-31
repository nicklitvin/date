import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { ErrorLogInput } from "../src/types";

afterEach( async () => {
    await handler.errorLog.deleteAllErrorLogs();
})

describe("errorLog", () => {
    const funcs = handler.errorLog;

    const input : ErrorLogInput = {
        device: "device",
        message: "message"
    };

    it("should record errorLog", async () => {
        expect(await funcs.recordErrorLog(input)).not.toEqual(null);
    })

    it("should get errorLogs", async () => {
        await Promise.all([
            funcs.recordErrorLog(input, new Date(0)),
            funcs.recordErrorLog(input, new Date(10)),
            funcs.recordErrorLog(input, new Date(20))
        ])

        const logs_1 = await funcs.getErrorLogs(0,new Date(100));
        expect(logs_1.length).toEqual(0);

        const logs_2 = await funcs.getErrorLogs(3,new Date(100));
        expect(logs_2.length).toEqual(3);

        const logs_3 = await funcs.getErrorLogs(1, new Date(15));
        expect(logs_3.length).toEqual(1);
        expect(logs_3[0].timestamp.getTime()).toEqual(new Date(10).getTime())

        const logs_4 = await funcs.getErrorLogs(2, new Date(15));
        expect(logs_4.length).toEqual(2);
        expect(logs_4[0].timestamp.getTime()).toEqual(new Date(10).getTime());
        expect(logs_4[1].timestamp.getTime()).toEqual(new Date(0).getTime());
    })

    it("should delete errorLogs", async () => {
        await Promise.all([
            funcs.recordErrorLog(input, new Date(0)),
            funcs.recordErrorLog(input, new Date(10)),
            funcs.recordErrorLog(input, new Date(20))
        ])

        expect(await funcs.deleteAllErrorLogs()).toEqual(3);
    })
})