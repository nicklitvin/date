import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { VerificationMob } from "../src/pages/Verification"
import { eduEmailText, verifyCodeText } from "../src/text";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import { ConfirmVerificationInput, NewCodeInput, NewVerificationInput } from "../src/interfaces";
import { RootStore, createStoreProvider } from "../src/store/RootStore";

describe("verification", () => {
    it("should send verification code", async () => {
        const eduEmail = "a@berkeley.edu";
        const personalEmail = "a@gmail.com";
        let sent = false;

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.newVerification).reply( config => {
            const payload = JSON.parse(config.data) as NewVerificationInput;
            expect(payload.personalEmail).toEqual(personalEmail);
            expect(payload.schoolEmail).toEqual(eduEmail);
            sent = true;
            return [200]
        })

        const returnCurrentPage = jest.fn( (input : number) => input);
        const store = new RootStore();
        store.globalState.setEmail(personalEmail);
        const StoreProvider = createStoreProvider(store);

        render(
            <StoreProvider value={store}>
                <VerificationMob
                    returnCurrentPage={returnCurrentPage}
                />
            </StoreProvider>
        );

        const input = screen.getByPlaceholderText(eduEmailText.inputPlaceholder);
        await act( () => {
            fireEvent(input, "changeText", eduEmail);
        })
        await act( () => {
            fireEvent(input, "submitEditing");
        })

        expect(returnCurrentPage).toHaveLastReturnedWith(1);
        expect(sent).toEqual(true);
    })

    it("should stay on page if bad email", async () => {
        const eduEmail = "a@berkeley.edu";
        const personalEmail = "a@gmail.com";

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.newVerification).reply( config => {
            return [400]
        })

        const returnCurrentPage = jest.fn( (input : number) => input);
        const store = new RootStore();
        store.globalState.setEmail(personalEmail);
        const StoreProvider = createStoreProvider(store);

        render(
            <StoreProvider value={store}>
                <VerificationMob
                    returnCurrentPage={returnCurrentPage}
                />
            </StoreProvider>
        );

        const input = screen.getByPlaceholderText(eduEmailText.inputPlaceholder);
        await act( () => {
            fireEvent(input, "changeText", eduEmail);
        })
        await act( () => {
            fireEvent(input, "submitEditing");
        })

        expect(returnCurrentPage).toHaveLastReturnedWith(0);
    })

    it("should verify code", async () => {
        const eduEmail = "a@berkeley.edu";
        const personalEmail = "a@gmail.com";
        const code = "1234";
        let sent = false;

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.verifyUser).reply( config => {
            const payload = JSON.parse(config.data) as ConfirmVerificationInput;
            expect(payload.code).toEqual(Number(code));
            expect(payload.personalEmail).toEqual(personalEmail);
            expect(payload.schoolEmail).toEqual(eduEmail);
            sent = true;
            return [200]
        })

        const store = new RootStore();
        store.globalState.setEmail(personalEmail);
        const StoreProvider = createStoreProvider(store);

        render(
            <StoreProvider value={store}>
                <VerificationMob
                    currentPage={1}
                    eduEmail={eduEmail}
                />
            </StoreProvider>
        );

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
        const eduEmail = "a@berkeley.edu";
        const personalEmail = "a@gmail.com";
        let sent = false;

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.newCode).reply( config => {
            const payload = JSON.parse(config.data) as NewCodeInput;
            expect(payload.personalEmail).toEqual(personalEmail);
            sent = true;
            return [200]
        })

        const store = new RootStore();
        store.globalState.setEmail(personalEmail);
        const StoreProvider = createStoreProvider(store);

        render(
            <StoreProvider value={store}>
                <VerificationMob
                    currentPage={1}
                    eduEmail={eduEmail}
                    lastSend={new Date(0)}
                />
            </StoreProvider>
        );

        await act( () => {
            fireEvent(screen.getByText(verifyCodeText.resendButton), "press");
        })

        expect(sent).toEqual(true);
    })

    it("should not resend code too quickly", async () => {
        const personalEmail = "a@gmail.com";
        let sent = false

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.newCode).reply( config => {
            sent = true;
            return [200]
        })
        
        const store = new RootStore();
        store.globalState.setEmail(personalEmail);
        const StoreProvider = createStoreProvider(store);

        render(
            <StoreProvider value={store}>
                <VerificationMob
                    currentPage={1}
                />
            </StoreProvider>
        );

        await act( () => {
            fireEvent(screen.getByText(verifyCodeText.resendButton), "press");
        })
        await act( () => {
            fireEvent(screen.getByText(verifyCodeText.resendButton), "press");
        })

        expect(sent).toEqual(false);
    })
})