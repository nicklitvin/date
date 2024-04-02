import { act, fireEvent, render, screen } from "@testing-library/react-native"
import VerificationMob from "../app/Verification";
import { eduEmailText, verifyCodeText } from "../src/text";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import { ConfirmVerificationInput, NewVerificationInput } from "../src/interfaces";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { globals } from "../src/globals";

describe("verification", () => {
    const eduEmail = "a@berkeley.edu";
    const personalEmail = "a@gmail.com";

    const load = async (currentPage? : number, customSeconds? : number, eduEmail? : string) => {
        const mock = new MockAdapter(axios);

        const store = new RootStore();
        const StoreProvider = createStoreProvider(store);

        const getCurrentPage = jest.fn();
        const getSeconds = jest.fn();

        render(
            <StoreProvider value={store}>
                <VerificationMob
                    returnSeconds={getSeconds}
                    returnCurrentPage={getCurrentPage}
                    currentPage={currentPage}
                    customSeconds={customSeconds}
                    eduEmail={eduEmail}
                />
            </StoreProvider>
        )

        return { mock, store, getCurrentPage, getSeconds }
    }

    it("should send verification", async () => {
        const { mock, getCurrentPage } = await load();
        let sent = false;

        mock.onPost(URLs.server + URLs.newVerification).reply( config => {
            const payload = JSON.parse(config.data) as NewVerificationInput;
            expect(payload.schoolEmail).toEqual(eduEmail);
            sent = true;
            return [200]
        })

        const input = screen.getByPlaceholderText(eduEmailText.inputPlaceholder);
        await act( () => {
            fireEvent(input, "changeText", eduEmail);
        })
        await act( () => {
            fireEvent(input, "submitEditing");
        })

        expect(getCurrentPage).toHaveBeenLastCalledWith(1);
        expect(sent).toEqual(true);
    })

    it("should stay on page if bad email", async () => {
        const { mock, getCurrentPage } = await load();

        mock.onPost(URLs.server + URLs.newVerification).reply( config => [400])

        const input = screen.getByPlaceholderText(eduEmailText.inputPlaceholder);
        await act( () => {
            fireEvent(input, "changeText", eduEmail);
        })
        await act( () => {
            fireEvent(input, "submitEditing");
        })

        expect(getCurrentPage).toHaveBeenLastCalledWith(0);
    })

    it("should verify code", async () => {
        const { mock } = await load(1,0,eduEmail);
        const code = "1234";
        let sent = false;

        mock.onPost(URLs.server + URLs.verifyUser).reply( config => {
            const payload = JSON.parse(config.data) as ConfirmVerificationInput;
            expect(payload.code).toEqual(Number(code));
            expect(payload.schoolEmail).toEqual(eduEmail);
            sent = true;
            return [200]            
        })

        const inputCode = screen.getByPlaceholderText(verifyCodeText.inputPlaceholder);
        await act( () => {
            fireEvent(inputCode, "changeText", code);
        })
        await act( () => {
            fireEvent(inputCode, "submitEditing")
        })

        expect(sent).toEqual(true);
    })

    it("should resend code", async () => {
        const { mock, getSeconds} = await load(1,0,eduEmail);

        mock.onPost(URLs.server + URLs.newCode).reply( config => [200] )

        await act( () => {
            fireEvent(screen.getByText(verifyCodeText.resendButton), "press");
        })

        expect(getSeconds).toHaveBeenLastCalledWith(globals.resendVerificationTimeout);
    })

    it("should not resend code too quickly", async () => {
        const { mock } = await load(1,10,eduEmail);
        let sent = false;

        mock.onPost(URLs.server + URLs.newCode).reply( config => {
            sent = true;
            return [200]
        })

        expect(screen.queryByText(verifyCodeText.resendButton)).toEqual(null);

        await act( () => {
            fireEvent(screen.getByText(
                `${verifyCodeText.resending} ${globals.resendVerificationTimeout}s`
            ), "press")
        })

        expect(sent).toEqual(false);
    })
})