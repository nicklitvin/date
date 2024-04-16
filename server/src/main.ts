import { MyServer } from "./myServer";

const server = new MyServer({
    disableEmail: true
});
server.setupEnvironment({
    clearTables: true,
    createSampleUsers: false,
    createUser: true,
    loginUser: true,
    verifyUser: true
});
console.log(`running server on port ${server.port}`)