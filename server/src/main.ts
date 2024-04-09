import { MyServer } from "./myServer";

const server = new MyServer();
server.createSample();
console.log(`running server on port ${server.port}`)