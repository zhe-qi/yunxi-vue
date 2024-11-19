import type { ExecutionContext } from '@nestjs/common'
import type { UserType } from 'src/module/system/user/dto/user'
import { createParamDecorator, SetMetadata } from '@nestjs/common'

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})

export type UserDto = UserType

export const NotRequireAuth = () => SetMetadata('notRequireAuth', true)

export const UserTool = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()

  const userName = request.user?.user?.userName

  const injectCreate = (data: any) => {
    if (data.createBy) {
      return
    }
    data.createBy = userName

    return injectUpdate(data)
  }

  const injectUpdate = (data: any) => {
    if (data.updateBy) {
      return
    }
    data.updateBy = userName
  }

  return { injectCreate, injectUpdate }
})

export interface UserToolType {
  injectCreate: <T extends { [key: string]: any }>(data: T) => T & { createBy?: string }
  injectUpdate: <T extends { [key: string]: any }>(data: T) => T & { updateBy?: string }
}
