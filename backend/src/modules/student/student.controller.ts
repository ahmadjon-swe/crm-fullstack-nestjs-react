import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiTags, ApiResponse,
  ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiForbiddenResponse,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  @ApiBadRequestResponse({ description: 'Phone already registered or validation error' })
  create(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }

  @Get()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get all active students with their groups' })
  @ApiResponse({ status: 200, description: 'List of active students' })
  findAll() {
    return this.studentService.findAll();
  }

  @Get('deleted')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get soft-deleted students (left the center)' })
  @ApiResponse({ status: 200, description: 'List of students who left' })
  findAllDeleted() {
    return this.studentService.findAllDeleted();
  }

  @Get('debtors')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get students with unpaid fees for current month' })
  @ApiResponse({ status: 200, description: 'List of debtors for current month with debt amount' })
  getDebtors() {
    return this.studentService.getDebtors();
  }

  @Get(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get student by ID with full details' })
  @ApiResponse({ status: 200, description: 'Student data with groups, payments, attendances' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(+id);
  }

  @Patch(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Update student data' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiBadRequestResponse({ description: 'Phone already taken or validation error' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Soft-delete student (leave the center). Attendance cleared, balance kept.' })
  @ApiResponse({ status: 200, description: 'Student removed from center' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  remove(@Param('id') id: string) {
    return this.studentService.remove(+id);
  }

  @Patch(':id/restore')
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Restore soft-deleted student (superadmin only)' })
  @ApiResponse({ status: 200, description: 'Student restored successfully' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiForbiddenResponse({ description: 'Only superadmin can restore students' })
  restore(@Param('id') id: string) {
    return this.studentService.restore(+id);
  }
}
