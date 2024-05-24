import yargs from "yargs";
import { EnvironmentSetup, MyServer } from "./myServer";

export const server = new MyServer({
    disableEmail: true
});

const argv = yargs
    .option('reset', {
        alias: 'r',
        describe: 'Reset Interactions',
        type: 'boolean',
    })
    .option('single', {
        alias: 's',
        describe: 'Just creates user',
        type: "boolean",
    })
    .option('construct', {
        alias: "c",
        describe: "Creates user and others",
        type: "boolean"
    })
    .help()
    .alias('help', 'h')
    .argv as { reset? : boolean, single? : boolean, construct? : boolean};

let command : EnvironmentSetup|undefined;

if (argv.reset) {
    command = {
        clearTables: false,
        createSampleUsers: false,
        createUser: false,
        loginUser: false,
        verifyUser: false,
        addSubscription: false,
        clearInteractionEntries: true,
    }
} else if (argv.single) {
    command = {
        clearTables: true,
        addSubscription: false,
        clearInteractionEntries: true,
        createSampleUsers: false,
        createUser: true,
        loginUser: true,
        verifyUser: true
    }
} else if (argv.construct) {
    command = {
        clearTables: true,
        createSampleUsers: true,
        createUser: true,
        loginUser: true,
        verifyUser: true,
        addSubscription: true,
        clearInteractionEntries: true
    }
}

server.setupEnvironment(command);
console.log("server is running");