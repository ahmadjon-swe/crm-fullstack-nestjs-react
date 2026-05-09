import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiTags, ApiResponse,
  ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiForbiddenResponse,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new teacher' })
  @ApiResponse({ status: 201, description: 'Teacher created successfully' })
  @ApiBadRequestResponse({ description: 'Phone number already registered or validation error' })
  @ApiUnauthorizedResponse({ description: 'Access token missing or invalid' })
  create(@Body() dto: CreateTeacherDto) {
    return this.teacherService.create(dto);
  }

  @Get()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get all active teachers with their groups' })
  @ApiResponse({ status: 200, description: 'List of active teachers' })
  findAll() {
    return this.teacherService.findAll();
  }

  @Get('deleted')
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get soft-deleted teachers (superadmin only)' })
  @ApiResponse({ status: 200, description: 'List of deleted teachers' })
  @ApiForbiddenResponse({ description: 'Only superadmin can view deleted teachers' })
  findAllDeleted() {
    return this.teacherService.findAllDeleted();
  }

  @Get(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get teacher by ID' })
  @ApiResponse({ status: 200, description: 'Teacher data with groups' })
  @ApiNotFoundResponse({ description: 'Teacher not found' })
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(+id);
  }

  @Patch(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Update teacher data' })
  @ApiResponse({ status: 200, description: 'Teacher updated successfully' })
  @ApiNotFoundResponse({ description: 'Teacher not found' })
  @ApiBadRequestResponse({ description: 'Phone already taken or validation error' })
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teacherService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Soft-delete teacher (sets teacher to null in groups)' })
  @ApiResponse({ status: 200, description: 'Teacher deleted successfully' })
  @ApiNotFoundResponse({ description: 'Teacher not found' })
  remove(@Param('id') id: string) {
    return this.teacherService.remove(+id);
  }

  @Patch(':id/restore')
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Restore soft-deleted teacher (superadmin only)' })
  @ApiResponse({ status: 200, description: 'Teacher restored successfully' })
  @ApiNotFoundResponse({ description: 'Teacher not found' })
  restore(@Param('id') id: string) {
    return this.teacherService.restore(+id);
  }
}
