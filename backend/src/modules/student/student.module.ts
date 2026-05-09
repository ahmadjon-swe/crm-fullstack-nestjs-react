import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student } from './entities/student.entity';
import { jwtConstants } from 'src/shared/constants/jwt.contstant';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    JwtModule.register({ secret: jwtConstants.access_secret }),
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
