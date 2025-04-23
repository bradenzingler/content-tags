import { NextResponse } from "next/server"

export const ERROR_CODES = {
    INVALID_REQUEST: "invalid_request",
    API_KEY_MISSING: "api_key_missing",
}

export const DOC_URLS = {
    INVALID_REQUEST: "https://inferly.com/docs/errors/invalid-request",
}

export const invalidRequest = (message: string) => {
    return NextResponse.json({
        error_code: ERROR_CODES.INVALID_REQUEST,
        documentation_url: DOC_URLS.INVALID_REQUEST,
        error_description: message
    }, { status: 400 });
}