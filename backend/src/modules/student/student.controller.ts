import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesAdmin } from 'src/shared/enums/roles.enum';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Create student' })
  create(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }

  @Get()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get all students' })
  findAll() {
    return this.studentService.findAll();
  }

  @Get('deleted')
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get deleted (left) students' })
  findAllDeleted() {
    return this.studentService.findAllDeleted();
  }

  @Get('debtors')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get students with unpaid fees for current month' })
  getDebtors() {
    return this.studentService.getDebtors();
  }

  @Get(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get student by id' })
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(+id);
  }

  @Patch(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Update student' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Soft delete student (leave center)' })
  remove(@Param('id') id: string) {
    return this.studentService.remove(+id);
  }

  @Patch(':id/restore')
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Restore deleted student' })
  restore(@Param('id') id: string) {
    return this.studentService.restore(+id);
  }
}
