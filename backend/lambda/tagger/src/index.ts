
export const handler = async (event: APIGateway) => {
    console.log("Received event:", JSON.stringify(event));
    const apiKeyInfo = event.requestContext.authorizer;


    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello, world!" }),
    };
}
