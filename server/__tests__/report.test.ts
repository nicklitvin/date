import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { createReportInput } from "../__testUtils__/easySetup";

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
})