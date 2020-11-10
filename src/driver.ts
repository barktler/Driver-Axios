/**
 * @author WMXPY
 * @namespace Axios
 * @description Driver
 */

import { IRequestConfig, IResponseConfig, PendingRequest, RequestDriver } from "@barktler/driver";
import Axios, { AxiosRequestConfig, AxiosResponse, Canceler, CancelToken } from "axios";

export type AxiosDriverOptions = {

    readonly bodyType: 'json' | 'form-data';
};

export const generateAxiosRequest = <Body>(request: IRequestConfig<Body>, cancelToken: CancelToken, options: AxiosDriverOptions): AxiosRequestConfig => {

    let data: any;

    if (typeof request.body === 'undefined' || request.body === null) {

        data = undefined;
    } else if (options.bodyType === 'json') {

        data = request.body;
    } else if (options.bodyType === 'form-data') {

        const formData: FormData = new FormData();
        const keys: Array<keyof Body> = Object.keys(request.body) as Array<keyof Body>;

        for (const key of keys) {
            formData.append(key as string, request.body[key] as any);
        }
    }

    return {

        cancelToken,

        url: request.url,
        method: request.method,

        headers: request.headers,
        params: request.params,
        data,

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

export const createAxiosDriver = (options: Partial<AxiosDriverOptions> = {}): RequestDriver => {

    const mergedOptions: AxiosDriverOptions = {

        bodyType: 'json',
        ...options,
    };

    const axiosDriver: RequestDriver = <Body extends any = any, Data extends any = any>(request: IRequestConfig<Body>): PendingRequest<Body, Data> => {

        let canceler: Canceler;
        const cancelToken: CancelToken = new Axios.CancelToken((targetCanceler: Canceler) => {
            canceler = targetCanceler;
        });
        const requestConfig: AxiosRequestConfig = generateAxiosRequest<Body>(request, cancelToken, mergedOptions);

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
