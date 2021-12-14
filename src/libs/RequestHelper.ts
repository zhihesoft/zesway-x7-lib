import { getLogger } from "log4js";
import request = require("request");
import { promisify } from "util";

export async function getFromX7(url: string, args: any): Promise<any> {
    const logger = getLogger(getFromX7.name);
    const query = toQueryString(args);
    if (query.length > 0) {
        url = `${url}?${query}`;
    }
    logger.info(`url: ${url}`);

    const ret = await promisify((_url: string, fun: (err: any, data: any) => void) => {
        request.get(_url, (error: any, response: any, body: any) => {
            if (error) {
                logger.error(`failed: ${error}`);
                fun(undefined, undefined);
            } else {
                if ((response.statusCode + "").startsWith("2")) {
                    logger.info(`request return: ` + body);
                    fun(undefined, body);
                } else {
                    logger.error("failed, status code: " + response.statusCode);
                    fun(undefined, undefined);
                }
            }
        });
    });
    return ret;
}

function toQueryString(obj: any) {
    const arr = [];
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const element = obj[key];
            arr.push({ key, element });
        }
    }
    return arr.map(i => `${i.key}=${i.element}`).join("&");
}
