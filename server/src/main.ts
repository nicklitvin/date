import { MyServer } from "./myServer";

const server = new MyServer({
    disableEmail: true,
    createUser: true,
    loginUser: true,
    verifyUser: true
});
server.createSample();
console.log(`running server on port ${server.port}`)