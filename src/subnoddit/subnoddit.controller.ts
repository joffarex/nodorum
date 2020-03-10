import { Controller, Post, Body, Get, UsePipes, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { SubnodditService } from './subnoddit.service';
import { JoiValidationPipe } from 'src/shared/pipes/joi-validation.pipe';
import { filterSchema, createSchema, updateSchema } from './validator';
import { FilterDto, CreateSubnodditDto, UpdateSubnodditDto } from './dto';
import { SubnodditsBody, SubnodditBody } from './interfaces/subnoddit.interface';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { AppLogger } from 'src/app.logger';

@Controller('subnoddit')
export class SubnodditController {
  private logger = new AppLogger('SubnodditController');

  constructor(private readonly subnodditService: SubnodditService) {}

  @Post('/')
  async findMany(@Body(new JoiValidationPipe(filterSchema)) filter: FilterDto): Promise<SubnodditsBody> {
    const subnodditsBody = await this.subnodditService.findMany(filter);
    this.logger.debug(`[findMany] found all subnoddits`)

    return subnodditsBody
  }

  @Get('/:subnodditId')
  async findOne(@Param('subnodditId') subnodditId: number): Promise<SubnodditBody> {
    const subnodditBody = await this.subnodditService.findOne(subnodditId);
    this.logger.debug(`[findOne] subnoddit with id: ${subnodditBody.subnoddit.id} found`)

    return subnodditBody
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(createSchema))
  async create(@Body() createSubnodditDto: CreateSubnodditDto, @User() user: JwtPayload): Promise<SubnodditBody> {
    const subnodditBody = await this.subnodditService.create(user.id, createSubnodditDto);
    this.logger.debug(`[create] subnoddit ${subnodditBody.subnoddit.name}(${subnodditBody.subnoddit.id})  created`)

    return subnodditBody
  }

  @Put('/:subnodditId/update')
  @UseGuards(AuthGuard)
  async update(
    @Param('subnodditId') subnodditId: number,
    @Body(new JoiValidationPipe(updateSchema)) updateSubnodditDto: UpdateSubnodditDto,
    @User() user: JwtPayload,
  ): Promise<SubnodditBody> {
    const subnodditBody = await this.subnodditService.update(user.id, subnodditId, updateSubnodditDto);
    this.logger.debug(`[update] subnoddit ${subnodditBody.subnoddit.name}(${subnodditBody.subnoddit.id}) updated`)

    return subnodditBody
  }

  @Delete('/:subnodditId/delete')
  @UseGuards(AuthGuard)
  async delete(@Param('subnodditId') subnodditId: number, @User() user: JwtPayload): Promise<{ message: string }> {
    const res = await this.subnodditService.delete(user.id, subnodditId);
    this.logger.debug(`[delete] subnoddit with id: ${subnodditId} removed`);

    return res;
  }
}
