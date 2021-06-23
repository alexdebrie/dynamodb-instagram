import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { getPhoto } from "../data/photo"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const { username, photoId } = event.pathParameters
    const photo = await getPhoto(username, photoId)
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            photo
        })
    }

    return response
}
