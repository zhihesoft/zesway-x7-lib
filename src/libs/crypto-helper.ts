import crypto = require("crypto");
import { X7Request, X7Response } from "./common-protocol";

export function verify(data: string, sign: string, key: string, algorithm: "RSA-SHA1" | "RSA-SHA256"): boolean {
    const raw_sign_data = Buffer.from(sign, "base64");
    let verify = crypto.createVerify(algorithm);
    verify.update(data);
    verify.end();
    const isverified = verify.verify(key, raw_sign_data);
    if (!isverified) {
        return false;
    }
    return true;
}

export function publicDecrypt(data: string, key: string): string | undefined {
    try {
        const raw_encryp_data = Buffer.from(data, "base64");
        const decrypt_data = crypto.publicDecrypt(key, raw_encryp_data).toString("utf-8");
        return decrypt_data;
    } catch (err) {
        return;
    }
}

export function publicDecryptData<T>(data: string, key: string): T | undefined {
    const decrypt_data = publicDecrypt(data, key);
    if (!decrypt_data) {
        return;
    }
    const search = new URLSearchParams(decrypt_data);
    const ret: any = {};
    for (const item of search.entries()) {
        ret[item[0]] = item[1];
    }
    return ret;
}

export function getPayload(data: X7Request | X7Response): string {
    const apiMethod = data.apiMethod;
    const appKey = data.appkey;
    const gameType = data.gameType;
    const anydata = data as any;
    const time = anydata["reqTime"] || anydata["respTime"];
    const args = anydata["bizParams"] || anydata["bizResp"];

    return `POST ${apiMethod}@${appKey}#${gameType}.${time}\n\n${args}`;
}