import type { Request } from 'express'
import type { PagingDto } from 'src/common/dto'
import type { UserDto } from 'src/module/system/user/user.decorator'
import type { FindOptionsWhere, Repository } from 'typeorm'
import { Inject, Injectable, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { InjectRepository } from '@nestjs/typeorm'
import { ResultData } from 'src/common/utils/result'
import { In, SelectQueryBuilder } from 'typeorm'
import { LogEntity } from './log.entity'

@Injectable({ scope: Scope.REQUEST })
export class ExtendsLogService {
  @Inject(REQUEST)
  private readonly request: Request & { user: UserDto }

  constructor(
    @InjectRepository(LogEntity)
    readonly logRepo: Repository<LogEntity>,
  ) {}

  async findAll(query: PagingDto, where?: FindOptionsWhere<LogEntity>) {
    const entity = this.logRepo.createQueryBuilder('entity')

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize)
    }

    const orderMap: { [key: string]: 'ASC' | 'DESC' } = {
      descending: 'DESC',
      ascending: 'ASC',
    }

    if (where)
      entity.where(where)

    if (query.orderByColumn && query.isAsc) {
      entity.orderBy(`entity.${query.orderByColumn}`, orderMap[query.isAsc])
    }

    const [list, total] = await entity.getManyAndCount()

    return ResultData.ok({ list, total })
  }

  /**
   * @description: 录入日志
   */
  async logAction(logItem: Partial<LogEntity>) {
    const { originalUrl, method, headers, ip, body, query, user } = this.request

    const userAgent = headers['user-agent']

    const newBody = { ...body }

    if (newBody.password) {
      newBody.password = '******'
    }

    if (newBody.newPassword) {
      newBody.newPassword = '******'
    }

    const params: Partial<LogEntity> = {
      handleUrl: originalUrl,
      handleMethod: method,
      handleRemoteIp: ip,
      handleUa: userAgent,
      handleParam: { body: newBody, query },

      createBy: user?.user?.userName || body.userName,
      createTime: new Date(),

      ...logItem,
    }

    await this.logRepo.save(params)
  }
}
