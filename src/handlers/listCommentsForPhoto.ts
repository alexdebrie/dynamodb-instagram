import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { listCommentsForPhoto } from "../data/comment"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const { photoId } = event.pathParameters
    const comments = await listCommentsForPhoto(photoId)
    const response = {
        statusCode: 200,
        body: JSON.stringify({
          comments 
        })
    }

    return response
}
