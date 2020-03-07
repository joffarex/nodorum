import { Controller, Post, Body, Get, UsePipes,  Put, Param, Delete, UseGuards } from '@nestjs/common';
import { SubnodditService } from './subnoddit.service';
import { JoiValidationPipe } from 'src/shared/pipes/joi-validation.pipe';
import { filterSchema, createSchema, updateSchema } from './validator';
import { FilterDto, CreateSubnodditDto, UpdateSubnodditDto } from './dto';
import { SubnodditsBody, SubnodditBody } from './interfaces/subnoddit.interface';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('subnoddit')
export class SubnodditController {
  constructor(private readonly subnodditService: SubnodditService) {}

  @Post('/')
  async findMany(@Body(new JoiValidationPipe(filterSchema)) filter: FilterDto):  Promise<SubnodditsBody> {
    return this.subnodditService.findMany(filter);
  }

  @Get('/:subnodditId')
  async findOne(@Param('subnodditId') subnodditId: number): Promise<SubnodditBody> {
    return this.subnodditService.findOne(subnodditId);
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(createSchema))
  async create(@Body() createSubnodditDto: CreateSubnodditDto, @User() user: JwtPayload): Promise<SubnodditBody> {
    return this.subnodditService.create(user.id, createSubnodditDto)
  }

  @Put('/:subnodditId/update')
  @UseGuards(AuthGuard)
  async update(@Param('subnodditId') subnodditId: number, @Body(new JoiValidationPipe(updateSchema)) updateSubnodditDto: UpdateSubnodditDto, @User() user: JwtPayload): Promise<SubnodditBody> {
    return this.subnodditService.update(user.id, subnodditId, updateSubnodditDto);
  }

  @Delete('/:subnodditId/delete')
  @UseGuards(AuthGuard)
  async delete(@Param('subnodditId') subnodditId: number, @User() user: JwtPayload): Promise<{ message: string}> {
    return this.subnodditService.delete(user.id, subnodditId);
  }  
}
