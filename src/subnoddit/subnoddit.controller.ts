import { Controller, Post, Body, Get, UsePipes, Scope, Inject, Put, Param, Delete } from '@nestjs/common';
import { SubnodditService } from './subnoddit.service';
import { JoiValidationPipe } from 'src/shared/pipes/joi-validation.pipe';
import { filterSchema, createSchema, updateSchema } from './validator';
import { FilterDto, CreateSubnodditDto, UpdateSubnodditDto } from './dto';
import { SubnodditsBody, SubnodditBody } from './interfaces/subnoddit.interface';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

@Controller({
  path: 'subnoddit',
  scope: Scope.REQUEST,
})
export class SubnodditController {
  constructor(@Inject(REQUEST) private readonly request: FastifyRequest ,private readonly subnodditService: SubnodditService) {}

  @Post('/')
  async findMany(@Body(new JoiValidationPipe(filterSchema)) filter: FilterDto):  Promise<SubnodditsBody> {
    return this.subnodditService.findMany(filter);
  }

  @Get('/:subnodditId')
  async findOne(@Param('subnodditId') subnodditId: number): Promise<SubnodditBody> {
    return this.subnodditService.findOne(subnodditId);
  }

  @Post('/create')
  @UsePipes(new JoiValidationPipe(createSchema))
  async create(@Body() createSubnodditDto: CreateSubnodditDto): Promise<SubnodditBody> {
    return this.subnodditService.create(this.request.user.id, createSubnodditDto)
  }

  @Put('/:subnodditId/update')
  async update(@Param('subnodditId') subnodditId: number, @Body(new JoiValidationPipe(updateSchema)) updateSubnodditDto: UpdateSubnodditDto): Promise<SubnodditBody> {
    return this.subnodditService.update(this.request.user.id, subnodditId, updateSubnodditDto);
  }

  @Delete('/:subnodditId/delete')
  async delete(@Param('subnodditId') subnodditId: number): Promise<{ message: string}> {
    return this.subnodditService.delete(this.request.user.id, subnodditId);
  }  
}
