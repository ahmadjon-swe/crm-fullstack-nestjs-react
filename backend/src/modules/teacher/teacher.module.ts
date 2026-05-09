import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { Teacher } from './entities/teacher.entity';
import { jwtConstants } from 'src/shared/constants/jwt.contstant';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher]),
    JwtModule.register({ secret: jwtConstants.access_secret }),
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
