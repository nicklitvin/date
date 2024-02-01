import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { UserReportInput } from "../src/types";
import { randomUUID } from "crypto";

afterEach( async () => {
    await handler.report.deleteAllReports();
})

describe("report", () => {
    const funcs = handler.report;

    const makeReport = (randomID = false) : UserReportInput => {
        return {
            userID: randomID ? randomUUID() : "userID",
            reportedEmail: "email"
        }
    }

    it("should report user", async () => {
        expect(await funcs.makeReport(makeReport())).not.toEqual(null);
    })

    it("should get user reports", async () => {
        const report = makeReport();

        await Promise.all([
            funcs.makeReport(makeReport(true)),
            funcs.makeReport(makeReport(true)),
            funcs.makeReport(makeReport(true))
        ])

        expect(await funcs.getReportCountForEmail(report.reportedEmail)).toEqual(3);
    })

    it("should delete all reports", async () => {
        await Promise.all([
            funcs.makeReport(makeReport(true)),
            funcs.makeReport(makeReport(true)),
            funcs.makeReport(makeReport(true))
        ]);

        expect(await funcs.deleteAllReports()).toEqual(3);
    })
})