export interface X7Config {
    /**
     * 小七平台的AppKey
     */
    appKey: string;
    /**
     * 小七平台的公钥
     * 不需要添加-----BEGIN PUBLIC KEY-----和-----END PUBLIC KEY-----
     */
    x7PublicKey: string;
    /**
     * APP自己的私钥
     * 不需要添加-----BEGIN RSA PRIVATE KEY-----和-----END RSA PRIVATE KEY-----
     */
    appPrivateKey: string;
    /**
     * APP自己的公钥（需要提交到小七）
     * 不需要添加-----BEGIN PUBLIC KEY-----和-----END PUBLIC KEY-----
     */
    appPublicKey: string;
    /**
     * 是否线上
     */
    product: boolean;
}