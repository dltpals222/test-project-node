import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { PartnersRepository } from './partners.repository';
import { PartnersService } from './partners.service';

@Module({
  controllers: [PartnersController],
  providers: [PartnersService, PartnersRepository],
  exports: [PartnersService, PartnersRepository],
})
export class PartnersModule {}
