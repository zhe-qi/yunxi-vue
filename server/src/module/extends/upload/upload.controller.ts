import { Body, Controller, Get, HttpCode, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { ResultData } from 'src/common/utils/result'
import { MemberUser } from 'src/module/member/member-user/member-user.decorator'
import { MemberUserType } from 'src/module/member/member-user/member-user.dto'
import { ChunkFileDto, ChunkMergeFileDto, FileUploadDto, uploadIdDto } from './dto/index'

import { ExtendsUploadService } from './upload.service'

@ApiTags('通用-文件上传')
@Controller('extends/upload')
export class ExtendsUploadController {
  constructor(private readonly uploadService: ExtendsUploadService) {}

  /**
   * 文件上传
   * @param file
   * @returns
   */
  @ApiOperation({
    summary: '文件上传',
  })
  @ApiBody({
    type: FileUploadDto,
    required: true,
  })
  @HttpCode(200)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async singleFileUpload(@UploadedFile() file: Express.Multer.File, @MemberUser() user: MemberUserType) {
    const res = await this.uploadService.singleFileUpload(file, user)
    return ResultData.ok(res)
  }

  /**
   * 获取切片上传任务Id
   * @param file
   * @returns
   */
  @ApiOperation({
    summary: '获取切片上传任务Id',
  })
  @ApiBody({
    required: true,
  })
  @HttpCode(200)
  @Get('/chunk/uploadId')
  getChunkUploadId() {
    return this.uploadService.getChunkUploadId()
  }

  /**
   * 文件分片上传
   * @param file
   * @returns
   */
  @ApiOperation({
    summary: '文件切片上传',
  })
  @ApiBody({
    required: true,
  })
  @HttpCode(200)
  @Post('/chunk')
  @UseInterceptors(FileInterceptor('file'))
  chunkFileUpload(@UploadedFile() file: Express.Multer.File, @Body() body: ChunkFileDto) {
    return this.uploadService.chunkFileUpload(file, body)
  }

  /**
   * 文件分片合并
   * @returns
   */
  @ApiOperation({
    summary: '合并切片',
  })
  @ApiBody({
    type: ChunkMergeFileDto,
    required: true,
  })
  @HttpCode(200)
  @Post('/chunk/merge')
  chunkMergeFile(@Body() body: ChunkMergeFileDto) {
    return this.uploadService.chunkMergeFile(body)
  }

  /**
   * 获取切片上传任务结果
   * @param file
   * @returns
   *
   */
  @ApiOperation({
    summary: '获取切片上传结果',
  })
  @ApiQuery({
    type: uploadIdDto,
    required: true,
  })
  @HttpCode(200)
  @Get('/chunk/result')
  getChunkUploadResult(@Query() query: { uploadId: string }) {
    return this.uploadService.getChunkUploadResult(query.uploadId)
  }

  /**
   * 获取cos授权
   * @param query
   */
  @ApiOperation({
    summary: '获取cos上传密钥',
  })
  @ApiBody({
    required: true,
  })
  @Get('/cos/authorization')
  getAuthorization(@Query() query: { key: string }) {
    return this.uploadService.getAuthorization(query.key)
  }
}