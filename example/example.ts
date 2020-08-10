/**
 * @author WMXPY
 * @namespace Example
 * @description Example
 */

import { IResponseConfig, PendingRequest } from "@barktler/driver";
import { axiosDriver } from "../src/driver";

(async () => {

    const pending: PendingRequest = axiosDriver({

        url: 'https://google.com',
        method: 'GET',
    });

    setTimeout(() => {
        pending.abort();
    }, 1);
    const response: IResponseConfig = await pending.response;
    console.log(response.data);
})();
