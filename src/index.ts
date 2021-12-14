import { CheckLoginResp } from "./libs/CheckLoginResp";
import crypto = require("crypto");
import { getFromX7 } from "./libs/RequestHelper";

const x7CheckLoginV4Server = "https://api.x7sy.com/user/check_v4_login";

export async function checkLogin(appKey: string, token: string): Promise<CheckLoginResp | undefined> {
    const tokenkey = token;
    const md5 = crypto.createHash("md5");
    const sign = md5.update(`${appKey}${token}`).digest("hex");
    const result = await getFromX7(x7CheckLoginV4Server, { tokenkey, sign });
    if (!result) {
        return;
    }
    const resp: CheckLoginResp = JSON.parse(result);
    return resp;
}

export function signOrder(area: string, guid: string, orderId: string, price: string, subject: string, key: string): string {
    const signbody = [
        `game_area=${area}`,
        `game_guid=${guid}`,
        `game_orderid=${orderId}`,
        `game_price=${price}`,
        `subject=${subject}`
    ].join("&");
    const md5 = crypto.createHash("md5");
    const sign = md5.update(signbody + key).digest("hex");
    return sign;
}