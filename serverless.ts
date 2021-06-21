import type { Serverless } from "serverless/aws"

/**
 * Serverless support writing your configuration in js/ts out of the box.
 * Using Typescript, we get autocomplete as well. This is more
 * convenient that yaml if your deploy logic is not trivial,
 * and depends on things like environment variables.
 * Use ts-ignore because we know what we're doing.
 */
//@ts-ignore
const serverlessConfiguration: Serverless = {
    service: "serverless-esbuild-template",
    plugins: ["serverless-esbuild", "serverless-offline"],
    provider: { name: "aws", runtime: "nodejs12.x" },
    functions: {
        hello: {
            handler: "src/handler.hello",
            events: [{ http: { path: "hello", method: "get" } }]
        }
    }
}

module.exports = serverlessConfiguration
