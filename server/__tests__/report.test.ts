import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { createReportInput } from "../__testUtils__/easySetup";
import { addHours } from "date-fns";

afterEach( async () => {
    await handler.report.deleteAllReports();
})

describe("report", () => {
    const funcs = handler.report;

    it("should report user", async () => {
        expect(await funcs.makeReport(createReportInput())).not.toEqual(null);
    })

    it("should get user reports", async () => {
        const report = createReportInput();

        await Promise.all([
            funcs.makeReport(createReportInput(true)),
            funcs.makeReport(createReportInput(true)),
            funcs.makeReport(createReportInput(true))
        ])

        expect(await funcs.getReportCountForEmail(report.reportedEmail)).toEqual(3);
    })

    it("should delete all reports", async () => {
        await Promise.all([
            funcs.makeReport(createReportInput(true)),
            funcs.makeReport(createReportInput(true)),
            funcs.makeReport(createReportInput(true))
        ]);

        expect(await funcs.deleteAllReports()).toEqual(3);
    })

    it("should get report counts made today", async () => {
        const report = createReportInput(false);
        await Promise.all([
            funcs.makeReport(report, new Date()),
            funcs.makeReport(report, addHours(new Date(), -12)),
            funcs.makeReport(report, addHours(new Date(), -25)),
        ])

        expect(await funcs.getReportsMadeCountForToday(report.userID)).toEqual(2);

    })
})