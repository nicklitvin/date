import { afterAll, afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import axios from "axios";
import { handler } from "../jest.setup";
import { MyServer } from "../src/myServer";
import { createTimeoutSignal } from "../../frontend/src/utils";
import { URLs } from "../src/urls";

describe("api", () => {
    let server : MyServer;

    beforeAll( () => {
        server = new MyServer({
            disableEmail: true
        })
    })

    afterEach( async () => {
        await handler.deleteEverything();
    })

    afterAll( () => {
        server.close();
    })

    const sendRequest = async(subURL : string, data : any) => {
        return await axios.post(`http://localhost:${URLs.port}` + subURL, data, {
            signal: createTimeoutSignal(),
        })
    }

    it("should say hi", async () => {
        const response = await axios.get(`http://localhost:${URLs.port}`);
        expect(response.status == 200);
    })

    it("should create user", async () => {
    })
})