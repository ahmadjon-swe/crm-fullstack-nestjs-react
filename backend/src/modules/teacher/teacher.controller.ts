import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesAdmin } from 'src/shared/enums/roles.enum';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Create teacher' })
  create(@Body() dto: CreateTeacherDto) {
    return this.teacherService.create(dto);
  }

  @Get()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get all teachers' })
  findAll() {
    return this.teacherService.findAll();
  }

  @Get('deleted')
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get deleted teachers' })
  findAllDeleted() {
    return this.teacherService.findAllDeleted();
  }

  @Get(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get teacher by id' })
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(+id);
  }

  @Patch(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Update teacher' })
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teacherService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Soft delete teacher' })
  remove(@Param('id') id: string) {
    return this.teacherService.remove(+id);
  }

  @Patch(':id/restore')
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Restore deleted teacher' })
  restore(@Param('id') id: string) {
    return this.teacherService.restore(+id);
  }
}
