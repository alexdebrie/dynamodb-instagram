import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { followUser } from "../data/follow"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const { username: followedUsername } = event.pathParameters
    const { followingUsername } = JSON.parse(event.body)
    const follow = await followUser(followedUsername, followingUsername)
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            follow
        })
    }

    return response
}
