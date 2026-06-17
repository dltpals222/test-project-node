import { Module } from '@nestjs/common';
import { PartnersModule } from '../partners/partners.module';
import { RecordsModule } from '../records/records.module';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsRepository } from './assignments.repository';
import { AssignmentsService } from './assignments.service';

@Module({
  imports: [RecordsModule, PartnersModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsRepository],
  exports: [AssignmentsRepository],
})
export class AssignmentsModule {}
