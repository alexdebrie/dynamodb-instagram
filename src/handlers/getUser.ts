import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { getUser } from "../data/user"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const { username } = event.pathParameters
    const user = await getUser(username)
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            user
        })
    }

    return response
}
