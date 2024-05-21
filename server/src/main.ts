import { MyServer } from "./myServer";

export const server = new MyServer({
    disableEmail: true
});

const resetEverything = {
    clearTables: true,
    createSampleUsers: true,
    createUser: true,
    loginUser: true,
    verifyUser: true,
    addSubscription: true,
    clearInteractionEntries: true
}

const resetInteractions = {
    clearTables: false,
    createSampleUsers: false,
    createUser: false,
    loginUser: false,
    verifyUser: false,
    addSubscription: true,
    clearInteractionEntries: true,
}

server.setupEnvironment(resetInteractions);
console.log("server is running");