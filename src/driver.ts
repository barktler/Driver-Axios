/**
 * @author WMXPY
 * @namespace Axios
 * @description Driver
 */

import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { IRequestConfig, IResponseConfig, RequestDriver, PendingRequest } from "@barktler/driver";

export const generateAxiosRequest = <Body>(request: IRequestConfig<Body>): AxiosRequestConfig => {

    return {

        url: request.url,
        method: request.method,

        headers: request.headers,
        params: request.params,
        data: request.body,

        timeout: request.timeout,

        responseType: request.responseType,
    };
};

export const parseAxiosResponse = <Data>(response: AxiosResponse<Data>): IResponseConfig<Data> => {

    return {

        data: response.data,
        status: response.status,
        statusText: response.statusText,

        headers: response.headers,
    };
};

export const axiosDriver: RequestDriver = async <Body extends any = any, Data extends any = any>(request: IRequestConfig<Body>): PendingRequest<Body, Data> => {

    const requestConfig: AxiosRequestConfig = generateAxiosRequest<Body>(request);

    const pending: PendingRequest<Body, Data> = PendingRequest.create({

        response: (async (): Promise<IResponseConfig<Data>> => {

            const rawResponse: AxiosResponse<Data> = await Axios(requestConfig);
            const response = parseAxiosResponse<Data>(rawResponse);
            return response;
        })(),
        abort: () => {

        },
    });


    return response;
};
