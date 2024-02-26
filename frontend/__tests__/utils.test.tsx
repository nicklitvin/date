import { getChatTimestamp, getShortDate } from "../src/utils"

describe("utils", () => {
    const timeCases = [
        { date: new Date(Date.UTC(2000, 0, 1, 8, 0)), timezone: "PST", expected: "Jan. 1, 12:00am" },
        { date: new Date(Date.UTC(2000, 0, 1, 20, 30)), timezone: "PST", expected: "Jan. 1, 12:30pm" },
        { date: new Date(Date.UTC(2000, 0, 15, 16, 15)), timezone: "PST", expected: "Jan. 15, 8:15am" },
        { date: new Date(Date.UTC(2000, 2, 10, 2, 45)), timezone: "PST", expected: "Mar. 9, 6:45pm" },
        { date: new Date(Date.UTC(2000, 4, 19, 19, 20)), timezone: "PST", expected: "May 19, 12:20pm" },
        { date: new Date(Date.UTC(2000, 7, 5, 14, 10)), timezone: "GMT", expected: "Aug. 5, 2:10pm" },
        { date: new Date(Date.UTC(2000, 10, 25, 22, 0)), timezone: "CET", expected: "Nov. 25, 11:00pm" },
        { date: new Date(Date.UTC(2000, 11, 31, 6, 45)), timezone: "IST", expected: "Dec. 31, 12:15pm" }
    ]

    it("should make chat timestamp", () => {
        for (const testcase of timeCases) {
            expect(getChatTimestamp(testcase.date,testcase.timezone)).toEqual(testcase.expected);
        }
    })

    it("should get short date", () => {
        for (const testcase of timeCases) {
            expect([testcase.expected.slice(0,6), testcase.expected.slice(0,7)]).toContain(
                getShortDate(testcase.date,testcase.timezone)
            )
        }
    })
})