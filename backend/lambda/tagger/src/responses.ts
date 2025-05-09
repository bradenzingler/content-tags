import { ErrorCode } from "./types";

export const DOCS_ERR_URL = "https://inferly.org/docs/errors";

export function error(status: number, errorMsg: string, errorCode: ErrorCode) {
    return {
        statusCode: status,
        body: JSON.stringify({ 
            error_message: errorMsg,
            error_code: errorCode,
            documentation_url: `${DOCS_ERR_URL}/${errorCode.toLowerCase().replaceAll("_", "-")}`, 
        }),
    }
}