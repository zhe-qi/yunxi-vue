export const MEMBER_ENUM = {
  USER: 'member_user:',

  LOGIN_TOKEN_KEY: 'member_login_token:',
}

export const LOGIN_TOKEN_EXPIRESIN = 1000 * 60 * 60 * 24

/**
 * 删除标志:0代表存在 1代表删除
 */
export enum DelFlagEnum {
  /**
   * 存在
   */
  NORMAL = '0',
  /**
   * 删除
   */
  DELETE = '1',
}

/**
 * 数据状态:0正常,1停用
 */
export enum StatusEnum {
  /**
   * 正常
   */
  NORMAL = '0',
  /**
   * 停用
   */
  STOP = '1',
}
