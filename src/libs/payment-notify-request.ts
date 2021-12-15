export interface PaymentNotifyRequest {
    encryp_data: string;
    extends_info_data: string;
    game_area: string;
    game_level: string;
    game_orderid: string;
    game_role_id: string;
    game_role_name: string;
    sdk_version: string;
    subject: string;
    xiao7_goid: number;
    sign_data: string;
}