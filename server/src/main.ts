import { EnvironmentSetup, MyServer } from "./myServer";

export const server = new MyServer({
    disableEmail: true
});

const setups : {[key : string] : EnvironmentSetup} = {
    resetEverything: {
        clearTables: true,
        createSampleUsers: true,
        createUser: true,
        loginUser: true,
        verifyUser: true,
        addSubscription: true,
        clearInteractionEntries: true
    },
    resetInteractions: {
        clearTables: false,
        createSampleUsers: false,
        createUser: false,
        loginUser: false,
        verifyUser: false,
        addSubscription: false,
        clearInteractionEntries: true,
    },
    createUserOnly : {
        clearTables: true,
        addSubscription: false,
        clearInteractionEntries: true,
        createSampleUsers: false,
        createUser: true,
        loginUser: true,
        verifyUser: true
    }
}

server.setupEnvironment(setups.resetInteractions);
console.log("server is running");