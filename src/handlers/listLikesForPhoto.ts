import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { listLikesForPhoto } from "../data/like"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const { photoId } = event.pathParameters
    const likes = await listLikesForPhoto(photoId)
    const response = {
        statusCode: 200,
        body: JSON.stringify({
           likes 
        })
    }

    return response
}
