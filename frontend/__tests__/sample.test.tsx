import React from 'react';
import { CustomApp, CustomAppDefault } from '../src/App';
import {act, fireEvent, render, screen} from "@testing-library/react-native";

describe("sample", () => {
    it("should expect", async () => {
        expect(1).toEqual(1);
    })

    it("should render", async () => {
        const app = render(<CustomAppDefault/>);
        const x = await app.findAllByText("Open up App.tsx to start working on your app!");
        expect(x).toHaveLength(1);
    })

    it("should interact with store", async () => {
        const app = render(<CustomAppDefault/>);
        const x = await app.findAllByText("0");
        expect(x).toHaveLength(1);
        await act( async () => {
            const button = app.getByTestId("test");
            fireEvent(button,"press");
        })
        const after = await app.findAllByText("1");
        expect(after).toHaveLength(1);
    })

    it("should start again", async () => {
        const app = render(<CustomAppDefault/>);
        const x = await app.findAllByText("0");
        expect(x).toHaveLength(1);
    })
})