export interface CensorResp {
    respCode: string;   //	String	是	响应码，SUCCESS代表成功
    respMsg: string;    //	String	是	响应提示信息
    detectResult: {     //  Array	否	道具信息数组
        detectionLogId: string;     //	String	是	检查结果的ID
        level: string;              // 	String	是	检查结果的分类级别【1：通过，-1：不通过】
        labelCode: string;          //	String	是	违规分类码【0:正常; 1:其他; 2:色情; 3:广告; 4:暴恐; 5:违禁; 6:涉政; 7:谩骂; 8:灌水; 9:违反广告法; 10:涉价值观】
        sensitiveWords: string[];   //	Array	是	敏感词数组
    }
}
