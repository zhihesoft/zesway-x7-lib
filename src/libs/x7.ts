import { getLogger } from "log4js";
import { CensorResp } from "./censor-response";
import { CheckTokenResp } from "./check-token-resp";
import { X7Request, X7Response } from "./common-protocol";
import { X7Config } from "./config";
import { X7CensorServer, X7CensorServer_Test, x7TokenServer } from "./constants";
import { getPayload, publicDecryptData, verify } from "./crypto-helper";
import { PaymentNotifyEncryptData } from "./payment-encrypt-data";
import { PaymentNotifyRequest } from "./payment-notify-request";
import { httpGet, httpPost } from "./request-helper";
import crypto = require("crypto");



export class X7Instance {
    constructor(
        public config: X7Config
    ) { }

    public static readonly apiRoleQuery = "common.roleQuery";
    public static readonly apiMessageDetect = "x7Detection.messageDetect";
    public static readonly apiMessageDetectReport = "x7Detection.messageDetectReport";

    private logger = getLogger(X7Instance.name);

    /**
     * 检查TOKEN，并返回TOKEN所带的信息
     * @param token SDK返回的TOKEN
     */
    public async checkToken(token: string): Promise<CheckTokenResp | undefined> {
        const tokenkey = token;
        const md5 = crypto.createHash("md5");
        const sign = md5.update(`${this.config.appKey}${token}`).digest("hex");
        const result = await httpGet(x7TokenServer, { tokenkey, sign });
        if (!result) {
            return;
        }
        const resp: CheckTokenResp = JSON.parse(result);
        return resp;
    }

    /**
     * 获取订单签名
     * @param game_area 游戏区服
     * @param game_guid 小七GUID
     * @param game_orderid 订单号
     * @param game_price 价格（小数点后两位）
     * @param subject 商品名称
     */
    public signOrder(game_area: string, game_guid: string, game_orderid: string, game_price: string, subject: string): string {
        const signbody = [
            `game_area=${game_area}`,
            `game_guid=${game_guid}`,
            `game_orderid=${game_orderid}`,
            `game_price=${game_price}`,
            `subject=${subject}`
        ].join("&");
        const md5 = crypto.createHash("md5");
        const sign = md5.update(signbody + this.config.x7PublicKey).digest("hex");
        return sign;
    }

    /**
     * 解密支付回调数据
     * @param req 支付回调数据
     * @returns 如果成功，返回解密的数据，否则返回undefined
     */
    public decryptPaymentNotify(req: PaymentNotifyRequest): PaymentNotifyEncryptData | undefined {
        let arr = [];
        for (const key in req) {
            if (Object.prototype.hasOwnProperty.call(req, key)) {
                if (key != "sign_data") {
                    const element = (req as any)[key];
                    arr.push({ key, element });
                }
            }
        }
        arr.sort((a, b) => { return a.key.localeCompare(b.key); });
        arr = arr.map(v => `${v.key}=${v.element}`);
        const source_str = arr.join("&");


        if (!verify(source_str, req.sign_data, this.x7PublicKey, "RSA-SHA1")) {
            this.logger.error(`verify payment notify data failed`);
            return;
        }

        const decrypt_data = publicDecryptData<PaymentNotifyEncryptData>(req.encryp_data, this.x7PublicKey);
        if (!decrypt_data) {
            this.logger.error(`decrypt payment notify data failed`);
            return;
        }

        return decrypt_data;
    }

    public async censor(guid: string, message: string, osType: string): Promise<boolean> {
        this.logger.info(`${guid}(${osType}): ${message}`);
        const req = this.buildRequest(X7Instance.apiMessageDetect, osType, { guid, detectionMessage: message });
        this.logger.info(`${JSON.stringify(req)}`);
        const resp_text = await httpPost(this.censorServer, req);
        if (!resp_text) {
            this.logger.error(`censor failed!`);
            return false;
        }
        const resp: X7Response = JSON.parse(resp_text);
        if (!this.veriyHttpMessage(resp)) {
            this.logger.error(`censor failed: verify failed.`);
            return false;
        }

        const result: CensorResp = JSON.parse(resp.bizResp);
        if (result.respCode != "SUCCESS") {
            this.logger.error(`censor failed: ${result.respMsg}(${result.respCode}).`);
            return false;
        }

        if (result.detectResult.level == "1") {
            return true;
        }

        const report = this.buildRequest(X7Instance.apiMessageDetectReport, osType, { detectionLogId: result.detectResult.detectionLogId, operateType: "1" });
        await httpPost(this.censorServer, report);
        return false;
    }

    buildResponse(apiMethod: string, osType: string, data: any): X7Response {
        const resp: X7Response = {
            apiMethod,
            bizResp: JSON.stringify(data),
            appkey: this.config.appKey,
            respTime: new Date().toISOString(),
            gameType: "client",
            osType,
            signature: ""
        }
        this.signHttpMessage(resp);
        return resp;
    }

    buildRequest(apiMethod: string, osType: string, data: any): X7Request {
        const req: X7Request = {
            apiMethod,
            bizParams: JSON.stringify(data),
            appkey: this.config.appKey,
            reqTime: new Date().toISOString(),
            gameType: "client",
            osType,
            signature: ""
        }
        this.signHttpMessage(req);
        return req;
    }

    veriyHttpMessage(req: X7Request | X7Response): boolean {
        const payload = getPayload(req);
        this.logger.info(`verify http payload: ${payload}`);
        return verify(payload, req.signature, this.x7PublicKey, "RSA-SHA256");
    }

    private signHttpMessage(resp: X7Response | X7Request): void {
        const payload = getPayload(resp);
        var si = crypto.createSign("RSA-SHA256");
        si.update(payload);
        si.end();
        const buf = si.sign(this.appPrivateKey);
        const sign = buf.toString("base64");
        resp.signature = sign;
    }

    private get x7PublicKey() {
        if (this.config.x7PublicKey.startsWith("-----")) {
            return this.config.x7PublicKey;
        }
        return `-----BEGIN PUBLIC KEY-----\n${this.config.x7PublicKey}\n-----END PUBLIC KEY-----`;
    }

    private get appPrivateKey() {
        if (this.config.appPrivateKey.startsWith("-----")) {
            return this.config.appPrivateKey;
        }
        return `-----BEGIN RSA PRIVATE KEY-----\n${this.config.appPrivateKey}\n-----END RSA PRIVATE KEY-----`;
    }

    private get censorServer(): string {
        if (this.config.product) {
            return X7CensorServer;
        }
        return X7CensorServer_Test;
    }
}