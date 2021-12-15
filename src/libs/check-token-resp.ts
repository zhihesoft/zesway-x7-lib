export interface CheckTokenResp {
    errorno: number;
    errormsg: string;
    data: {
        guid: string;
        username: string;
        is_real_user: string;
        is_eighteen: string;
    }
}
