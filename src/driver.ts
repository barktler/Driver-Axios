/**
 * @author WMXPY
 * @namespace Axios
 * @description Driver
 */

import { IRequestConfig, IResponseConfig, PendingRequest, RequestDriver } from "@barktler/driver";
import Axios, { AxiosError, AxiosRequestConfig, AxiosResponse, Canceler, CancelToken } from "axios";

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

        succeed: true,

        data: response.data,
        status: response.status,
        statusText: response.statusText,

        headers: response.headers,
    };
};

export const parseAxiosError = <Data>(response: AxiosError<Data>): IResponseConfig<Data> => {

    return {

        succeed: false,

        data: response.response?.data as any,
        status: response.response?.status as any,
        statusText: response.response?.statusText as any,

        headers: response.response?.headers ?? {},
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

            response: (new Promise<IResponseConfig<Data>>((resolve: (response: IResponseConfig<Data>) => void) => {

                Axios(requestConfig).then((rawResponse: AxiosResponse<Data>) => {

                    const response: IResponseConfig<Data> = parseAxiosResponse<Data>(rawResponse);
                    resolve(response);
                    return;
                }).catch((rawErrorResponse: AxiosError<Data>) => {

                    const response: IResponseConfig<Data> = parseAxiosError<Data>(rawErrorResponse);
                    resolve(response);
                    return;
                });
            })),
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
