import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { listFollowersOfUser } from "../data/follow"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const { username } = event.pathParameters
    const followers = await listFollowersOfUser(username)
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            followers
        })
    }

    return response
}
