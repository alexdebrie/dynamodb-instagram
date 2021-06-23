import { DynamoDB } from "aws-sdk"

let client = null

export const getClient = (): DynamoDB => {
    if (client) return client
    client = new DynamoDB({
        httpOptions: {
            connectTimeout: 1000,
            timeout: 1000
        }
    })
    return client
}
