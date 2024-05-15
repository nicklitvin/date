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
    addSubscription: false,
    clearInteractionEntries: true
}

server.setupEnvironment(resetEverything);
console.log(`running server on port ${server.port}`)