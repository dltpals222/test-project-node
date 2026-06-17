import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { VerifyIdentityDto } from './dto/verify-identity.dto';
import { IdentityService } from './identity.service';

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  // 공개 엔드포인트 (가드 미부착) — 외부 본인인증은 인증 전 단계에서 일어나는 흐름을 모사
  @Post('verify')
  @HttpCode(200)
  verify(@Body() dto: VerifyIdentityDto) {
    return this.identityService.verify(dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.identityService.findOne(id);
  }
}
