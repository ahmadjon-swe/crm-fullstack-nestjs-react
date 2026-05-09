import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { Group } from './entities/group.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { Teacher } from 'src/modules/teacher/entities/teacher.entity';
import { jwtConstants } from 'src/shared/constants/jwt.contstant';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, Student, Teacher]),
    JwtModule.register({ secret: jwtConstants.access_secret }),
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
