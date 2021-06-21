import tcp from "tcp-port-used"
import execa from "execa"

export const httpPort = process.env.SLS_OFFLINE_HTTP_PORT || 3000
export const lambdaPort = process.env.SLS_OFFLINE_LAMBDA_PORT || 3002

export const offlineUrl = ({ env = "dev", port = httpPort, path }) => `http://localhost:${port}/${env}/${path}`

export const waitForPort = async ({ port = 3002, retries = 250, timeout = 10000 }) => {
    try {
        await tcp.waitUntilUsed(port, retries, timeout)
        // console.log(`Port ${port} is ready.`)
        return true
    } catch (error) {
        console.error(`Something went wrong with port ${port}... ${error.message}`)
        throw error
    }
}

export const run = (program: string, xargs: string[]) => execa(program, xargs, { stdio: "inherit" })
