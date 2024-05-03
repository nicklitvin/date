import { MyServer } from "./myServer";

const server = new MyServer({
    disableEmail: true
});
server.setupEnvironment({
    clearTables: true,
    createSampleUsers: true,
    createUser: true,
    loginUser: true,
    verifyUser: true,
    addSubscription: true,
});
console.log(`running server on port ${server.port}`)