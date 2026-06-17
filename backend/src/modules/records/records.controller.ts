import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateRecordDto } from './dto/create-record.dto';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RecordsService } from './records.service';

@ApiTags('records')
@ApiBearerAuth()
@Controller('records')
@UseGuards(JwtAuthGuard, RolesGuard) // 모든 엔드포인트 인증 필요
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  // 보관함은 status 파라미터 충돌을 피하려고 :id 라우트보다 먼저 선언
  @Get('archived')
  @Roles('superadmin', 'admin')
  findArchived() {
    return this.recordsService.findArchived();
  }

  @Get()
  @Roles('superadmin', 'admin', 'manager', 'member')
  findAll(@CurrentUser() actor: AuthUser) {
    return this.recordsService.findAll(actor);
  }

  @Get(':id')
  @Roles('superadmin', 'admin', 'manager', 'member')
  findOne(@CurrentUser() actor: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.recordsService.findOne(actor, id);
  }

  @Post()
  @Roles('superadmin', 'admin')
  create(@Body() dto: CreateRecordDto) {
    return this.recordsService.create(dto);
  }

  @Patch(':id/status')
  @Roles('superadmin', 'admin', 'manager', 'member')
  updateStatus(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.recordsService.updateStatus(actor, id, dto);
  }

  @Get(':id/history')
  @Roles('superadmin', 'admin', 'manager', 'member')
  getHistory(@CurrentUser() actor: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.recordsService.getHistory(actor, id);
  }

  @Get(':id/memos')
  @Roles('superadmin', 'admin', 'manager', 'member')
  listMemos(@CurrentUser() actor: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.recordsService.listMemos(actor, id);
  }

  @Post(':id/memos')
  @Roles('superadmin', 'admin', 'manager', 'member')
  addMemo(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMemoDto,
  ) {
    return this.recordsService.addMemo(actor, id, dto);
  }

  @Delete(':id')
  @Roles('superadmin', 'admin')
  softDelete(@CurrentUser() actor: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.recordsService.softDelete(actor, id);
  }

  @Patch(':id/restore')
  @Roles('superadmin', 'admin')
  restore(@CurrentUser() actor: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.recordsService.restore(actor, id);
  }
}
