import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@ApiTags('assignments')
@ApiBearerAuth()
@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @Roles('superadmin', 'admin', 'manager')
  listByRecord(@Query('recordId', ParseIntPipe) recordId: number) {
    return this.assignmentsService.listByRecord(recordId);
  }

  @Post()
  @Roles('superadmin', 'admin')
  assign(@CurrentUser() actor: AuthUser, @Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.assign(actor, dto);
  }

  @Delete()
  @Roles('superadmin', 'admin')
  remove(
    @CurrentUser() actor: AuthUser,
    @Query('recordId', ParseIntPipe) recordId: number,
    @Query('partnerId', ParseIntPipe) partnerId: number,
  ) {
    return this.assignmentsService.remove(actor, recordId, partnerId);
  }
}
