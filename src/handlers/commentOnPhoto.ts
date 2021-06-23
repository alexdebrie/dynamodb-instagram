import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { commentOnPhoto } from "../data/comment"
import { Photo } from "../data/photo"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const { username, photoId } = event.pathParameters
    const photo = new Photo(username, "", photoId)
    const { commentingUsername, content } = JSON.parse(event.body)
    const comment = await commentOnPhoto(photo, commentingUsername, content)
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            comment
        })
    }

    return response
}
