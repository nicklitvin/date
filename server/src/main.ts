import { MyServer } from "./myServer";

const server = new MyServer({
    disableEmail: true,
    createUser: false,
    loginUser: true,
    verifyUser: false
});
server.createSample();
console.log(`running server on port ${server.port}`)