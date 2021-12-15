export interface Role {
    roleId: string;             //	String	是	游戏角色ID
    guid: string;               //	String	是	小7小号ID
    roleName: string;           //	String	是	角色名称
    serverId: string;           //	String	是	角色所属区服ID
    serverName: string;         //	String	是	角色所属区服名称
    roleLevel: string;          //	String	是	角色等级， 示例：100
    roleCE: string;             //	String	是	角色战力，示例：20000
    roleStage: string;          //	String	是	角色关卡，示例：2-3
    roleRechargeAmount: number; //	Float	是	角色总充值，精度为小数点后2位
}

export interface QueryRoleResp {
    respCode: string;
    respMsg: string;
    role: Role | {}; 
    guidRoles: Role[];
}

export interface QueryRoleRequest {
    roleId: string;
    guid: string;
    guids: string[];
    serverId: string;
}
