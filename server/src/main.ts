import { MyServer } from "./myServer";

const server = new MyServer({
    disableEmail: true
});
server.setupEnvironment({
    clearTables: false,
    createSampleUsers: false,
    createUser: false,
    loginUser: false,
    verifyUser: false
});
console.log(`running server on port ${server.port}`)