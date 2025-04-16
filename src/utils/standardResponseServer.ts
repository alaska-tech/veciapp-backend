import {ResponseData} from "../types/serverResponse"

// Helper para respuestas exitosas
export const responseOk = <T>(data: T): ResponseData<T> => {
    return {
        data: data,
        error: null,
        status: "Success"
    }
}

// Helper para respuestas fallidas
export const responseError = <T>(error: T): ResponseData<T> => {
    return {
        data: null,
        error: error,
        status: "Error"
    }
}