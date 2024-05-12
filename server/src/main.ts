import { MyServer } from "./myServer";

export const server = new MyServer({
    disableEmail: true
});
server.setupEnvironment({
    clearTables: false,
    createSampleUsers: false,
    createUser: false,
    loginUser: false,
    verifyUser: false,
    addSubscription: false,
    clearInteractionEntries: true
});
console.log(`running server on port ${server.port}`)