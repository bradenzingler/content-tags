import { APIGatewayAuthorizerResultContext, APIGatewaySimpleAuthorizerWithContextResult } from "aws-lambda";
export type Response = APIGatewaySimpleAuthorizerWithContextResult<APIGatewayAuthorizerResultContext>;

export function unauthorized(message: string): Response {
    return {
        isAuthorized: false,
        context: { message },
    }
}

export function authorized(context: APIGatewayAuthorizerResultContext): Response {
    return {
        isAuthorized: true,
        context,
    }
}