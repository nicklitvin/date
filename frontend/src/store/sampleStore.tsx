import { makeAutoObservable } from "mobx";

export class SampleStore {
    public value = 0;

    constructor() {
        makeAutoObservable(this);
    }

    increment() {
        this.value += 1;
    }

    decrement() {
        this.value -= 1;
    }
}