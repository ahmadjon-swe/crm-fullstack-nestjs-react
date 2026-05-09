import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiResponse,
  ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesAdmin } from 'src/shared/enums/roles.enum';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new group with teacher assignment' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  @ApiNotFoundResponse({ description: 'Teacher not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() dto: CreateGroupDto) {
    return this.groupService.create(dto);
  }

  @Get()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get all active groups with teacher and student count' })
  @ApiResponse({ status: 200, description: 'List of active groups' })
  findAll() {
    return this.groupService.findAll();
  }

  @Get(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get group by ID with full details' })
  @ApiResponse({ status: 200, description: 'Group data with teacher, students, attendances' })
  @ApiNotFoundResponse({ description: 'Group not found' })
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Patch(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Update group data' })
  @ApiResponse({ status: 200, description: 'Group updated successfully' })
  @ApiNotFoundResponse({ description: 'Group or teacher not found' })
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Soft-delete group' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully' })
  @ApiNotFoundResponse({ description: 'Group not found' })
  remove(@Param('id') id: string) {
    return this.groupService.remove(+id);
  }

  @Post(':id/students/:studentId')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Add student to group' })
  @ApiResponse({ status: 201, description: 'Student added to group' })
  @ApiNotFoundResponse({ description: 'Group or student not found' })
  @ApiBadRequestResponse({ description: 'Student already in this group' })
  addStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.groupService.addStudent(+id, +studentId);
  }

  @Delete(':id/students/:studentId')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Remove student from group (clears attendance records for that group)' })
  @ApiResponse({ status: 200, description: 'Student removed from group. Attendance cleared.' })
  @ApiNotFoundResponse({ description: 'Group not found or student not in group' })
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.groupService.removeStudent(+id, +studentId);
  }

  @Get(':id/attendance')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get attendance for a group on a specific date' })
  @ApiQuery({ name: 'date', required: true, example: '2025-05-09', description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'Attendance records for the group on given date' })
  @ApiNotFoundResponse({ description: 'Group not found' })
  getAttendanceByDate(@Param('id') id: string, @Query('date') date: string) {
    return this.groupService.getAttendanceByDate(+id, date);
  }
}
