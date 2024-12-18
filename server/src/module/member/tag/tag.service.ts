import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Response } from 'express'
import { ExportTable } from 'src/common/utils/export'
import { ResultData } from 'src/common/utils/result'
import { Repository } from 'typeorm'
import { CreateTagDto, ListTagDto, UpdateTagDto } from './tag.dto'
import { TagEntity } from './tag.entity'

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagEntityRep: Repository<TagEntity>,
  ) { }

  async create(createTagDto: CreateTagDto) {
    const res = await this.tagEntityRep.save(createTagDto)
    return ResultData.ok(res)
  }

  async findAll(query: ListTagDto) {
    const entity = this.tagEntityRep.createQueryBuilder('entity')

    entity.where('entity.delFlag = :delFlag', { delFlag: '0' })

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status })
    }

    if (query.remark) {
      entity.andWhere('entity.remark = :remark', { remark: query.remark })
    }

    if (query.name) {
      entity.andWhere('entity.name like :name', { name: `%${query.name}%` })
    }

    if (query.code) {
      entity.andWhere('entity.code = :code', { code: query.code })
    }

    if (query.module) {
      entity.andWhere('entity.module = :module', { module: query.module })
    }

    if (query.createBy) {
      entity.andWhere('entity.createBy = :createBy', { createBy: query.createBy })
    }

    if (query.createTime && query.createTime.length === 2) {
      entity.andWhere('entity.createTime between :createTime0 and :createTime1', {
        createTime0: query.createTime[0],
        createTime1: query.createTime[1],
      })
    }

    if (query.updateBy) {
      entity.andWhere('entity.updateBy = :updateBy', { updateBy: query.updateBy })
    }

    if (query.updateTime && query.updateTime.length === 2) {
      entity.andWhere('entity.updateTime between :updateTime0 and :updateTime1', {
        updateTime0: query.updateTime[0],
        updateTime1: query.updateTime[1],
      })
    }

    if (query.pageNum && query.pageSize) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize)
    }

    const [rows, total] = await entity.getManyAndCount()

    return ResultData.rows({ rows, total })
  }

  async findOne(id: string) {
    const res = await this.tagEntityRep.findOne({
      where: { delFlag: '0', id },
    })
    return ResultData.ok(res)
  }

  async update(updateTagDto: UpdateTagDto) {
    const res = await this.tagEntityRep.update(
      { id: updateTagDto.id },
      updateTagDto,
    )
    return ResultData.ok(res)
  }

  async remove(id: string) {
    const data = await this.tagEntityRep.update(
      { id },
      { delFlag: '1' },
    )
    return ResultData.ok(data)
  }

  async export(res: Response, body: ListTagDto) {
    delete body.pageNum
    delete body.pageSize
    const list = await this.findAll(body)
    const options = {
      sheetName: '用户标签表',
      data: list.data.list,
      header: [
        { title: '状态', dataIndex: 'status' },
        { title: '备注', dataIndex: 'remark' },
        { title: '标签显示名', dataIndex: 'name' },
        { title: '标签code', dataIndex: 'code' },
        { title: '模块标志', dataIndex: 'module' },
      ],
    }
    ExportTable(options, res)
  }
}
