/**
 * @author WMXPY
 * @namespace Axios
 * @description Driver
 */

import { IRequestConfig, IResponseConfig, PendingRequest, RequestDriver } from "@barktler/driver";
import Axios, { AxiosRequestConfig, AxiosResponse, Canceler, CancelToken } from "axios";

export const generateAxiosRequest = <Body>(request: IRequestConfig<Body>, cancelToken: CancelToken): AxiosRequestConfig => {

    return {

        cancelToken,

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

export type AxiosDriverOptions = {
};

export const createAxiosDriver = (options: Partial<AxiosDriverOptions>): RequestDriver => {

    const axiosDriver: RequestDriver = <Body extends any = any, Data extends any = any>(request: IRequestConfig<Body>): PendingRequest<Body, Data> => {

        let canceler: Canceler;
        const cancelToken: CancelToken = new Axios.CancelToken((targetCanceler: Canceler) => {
            canceler = targetCanceler;
        });
        const requestConfig: AxiosRequestConfig = generateAxiosRequest<Body>(request, cancelToken);

        const pending: PendingRequest<Body, Data> = PendingRequest.create({

            response: (async (): Promise<IResponseConfig<Data>> => {

                const rawResponse: AxiosResponse<Data> = await Axios(requestConfig);
                const response = parseAxiosResponse<Data>(rawResponse);
                return response;
            })(),
            abort: () => {

                if (canceler) {
                    canceler();
                }
            },
        });
        return pending;
    };
    return axiosDriver;
};
