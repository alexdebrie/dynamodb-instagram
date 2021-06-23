import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { likePhoto } from "../data/like"
import { Photo } from "../data/photo"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const { username, photoId } = event.pathParameters
    const photo = new Photo(username, "", photoId)
    const { likingUsername } = JSON.parse(event.body)
    const like = await likePhoto(photo, likingUsername )
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            like
        })
    }

    return response
}
