import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { listFollowedByUser} from "../data/follow"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const { username } = event.pathParameters
    const following = await listFollowedByUser(username)
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            following
        })
    }

    return response
}
