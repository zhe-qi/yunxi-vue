import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { BusinessType } from 'src/common/constant/business.constant'
import { Operlog } from 'src/common/decorators/operlog.decorator'
import { RequirePermission } from 'src/common/decorators/require-premission.decorator'
import { CreateOperlogDto } from './dto/create-operlog.dto'
import { UpdateOperlogDto } from './dto/update-operlog.dto'
import { OperlogService } from './operlog.service'

@Controller('monitor/operlog')
export class OperlogController {
  constructor(private readonly operlogService: OperlogService) {}

  @Post()
  create(@Body() createOperlogDto: CreateOperlogDto) {
    return this.operlogService.create(createOperlogDto)
  }

  @ApiOperation({
    summary: '登录日志-清除全部日志',
  })
  @RequirePermission('monitor:logininfor:remove')
  @Delete('/clean')
  @Operlog({ businessType: BusinessType.CLEAN })
  removeAll() {
    return this.operlogService.removeAll()
  }

  @Get('/list')
  findAll(@Query() query: any) {
    return this.operlogService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operlogService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOperlogDto: UpdateOperlogDto) {
    return this.operlogService.update(+id, updateOperlogDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operlogService.remove(+id)
  }
}
