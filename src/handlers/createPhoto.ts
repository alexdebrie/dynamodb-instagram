import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { Photo, createPhoto } from "../data/photo"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const { username } = event.pathParameters
    const { url } = JSON.parse(event.body)
    const photo = new Photo(username, url)
    await createPhoto(photo)
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            photo
        })
    }

    return response
}
