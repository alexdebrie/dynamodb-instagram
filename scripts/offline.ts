import { httpPort, lambdaPort, run } from "./helpers"

const xargs = process.argv
const name = "offline-lambda-hello"

const slsArguments = ["offline", "--http-port", `${httpPort}`, "--lambda-port", `${lambdaPort}`]

//xargs: [tsnode, offline.ts, case]
const main = async () => {
    switch (xargs[2]) {
        case "dev":
            return run("sls", slsArguments)
        case "start":
            return run("pm2", ["start", "sls", "--name", name, "-l", "pm2.log", "--", ...slsArguments])
        case "stop":
            return run("pm2", ["delete", name])
    }
}

main().catch((error) => {
    console.error(error)
})
