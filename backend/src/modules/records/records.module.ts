import { Module } from '@nestjs/common';
import { PartnersModule } from '../partners/partners.module';
import { RecordsController } from './records.controller';
import { RecordsRepository } from './records.repository';
import { RecordsService } from './records.service';

@Module({
  imports: [PartnersModule],
  controllers: [RecordsController],
  providers: [RecordsService, RecordsRepository],
  exports: [RecordsService, RecordsRepository],
})
export class RecordsModule {}
