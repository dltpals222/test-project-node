import {
  Body,
  Controller,
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
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // 컨트롤러 전체 보호 (인증 → 인가)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('superadmin', 'admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('superadmin', 'admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('superadmin', 'admin')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id/reset-password')
  @Roles('superadmin', 'admin')
  resetPassword(@CurrentUser() actor: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.resetPassword(actor, id);
  }

  @Patch(':id/suspend')
  @Roles('superadmin', 'admin')
  suspend(@CurrentUser() actor: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.suspend(actor, id);
  }

  @Patch(':id/activate')
  @Roles('superadmin', 'admin')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.activate(id);
  }
}
