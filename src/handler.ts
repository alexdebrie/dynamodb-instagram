import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"

export const hello: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: "Go Serverless v1.0! Your function executed successfully!",
            input: event
        })
    }

    return response
}
