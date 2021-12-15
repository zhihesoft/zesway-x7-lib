export interface X7Request {
    bizParams: string;  //	String	是	业务参数，值为每个接口对应业务参数的JSON字符串
    apiMethod: string;  //	String	是	接口名称
    reqTime: string;    //	String	是	请求时间，格式使用ISO8601规范，示例：2021-12-15T14:34:25+0800
    appkey: string;     //	String	是	游戏appkey，如果双端使用相同appkey接入，osType字段必传
    gameType: string;   //	String	是	游戏端类型，网游为client H5游戏为 h5
    signature: string;  //	String	是	请求签名（签名方式参见下文）
    osType: string;     //	String	否	系统类型，ios或android
}

export interface X7Response {
    bizResp: string;    //	String	是	响应参数，值为每个接口对应响应参数的JSON字符串
    apiMethod: string;  //	String	是	接口名称
    respTime: string;   //	String	是	响应时间，格式使用ISO8601规范，示例：2021-12-15T14:34:25+0800
    appkey: string;     //	String	是	游戏appkey
    gameType: string;   //	String	是	游戏端类型，网游为client H5游戏为 h5
    signature: string;  //	String	是	响应签名（签名方式参见下文）
    osType: string;     //	String	否	系统类型，ios或android
}