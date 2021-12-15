import { getLogger } from "log4js";
import { promisify } from "util";
import { X7Request } from "./common-protocol";
import request = require("request");

function getQueryString(url: string, obj: any): string {
    if (!obj) {
        return url;
    }
    const arr = [];
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const element = obj[key];
            arr.push({ key, element });
        }
    }
    const querystring = arr.map(i => `${i.key}=${i.element}`).join("&");
    if (querystring.length > 0) {
        url = `${url}?${querystring}`;
    }
    return url;
}

export async function httpGet(url: string, args: any): Promise<string | undefined> {
    const logger = getLogger("x7-request-helper");
    url = getQueryString(url, args);
    logger.info(`http get: ${url}`);

    const ret = await promisify((url: string, callback: (err: any, result: string | undefined) => void) => {
        request.get(url, (error: any, response: any, body: any) => {
            if (error) {
                logger.error(`failed: ${error}`);
                callback(undefined, undefined);
            } else {
                if ((response.statusCode + "").startsWith("2")) {
                    logger.info(`request return: ` + body);
                    callback(undefined, body);
                } else {
                    logger.info(`failed: status code (${response.statusCode})`);
                    callback(undefined, undefined);
                }
            }
        });
    })(url);
    return ret;
}

export async function httpPost(url: string, req: X7Request): Promise<any> {
    const logger = getLogger("x7-http-post");
    logger.info(`post to ${url}`);
    return new Promise<any>((resolve) => {
        request.post({ url, form: req }, (err, resp, body) => {
            if (err) {
                logger.error(`post failed: ${err}`);
                return resolve(undefined);
            }
            if ((resp.statusCode + "").startsWith("2")) {
                logger.info(`${body}`);
                resolve(body);
            } else {
                logger.error(`post failed: status(${resp.statusCode})`);
                resolve(undefined);
            }

        })
    });
}
