import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiResponse,
  ApiBadRequestResponse, ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesAdmin } from 'src/shared/enums/roles.enum';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Mark attendance for a single student' })
  @ApiResponse({ status: 201, description: 'Attendance recorded successfully' })
  @ApiNotFoundResponse({ description: 'Student or group not found' })
  @ApiBadRequestResponse({ description: 'Student not in group or attendance already marked' })
  create(@Body() dto: CreateAttendanceDto, @Request() req: any) {
    return this.attendanceService.create(dto, req.user);
  }

  @Post('bulk')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Mark attendance for entire group on one day (upsert)' })
  @ApiResponse({ status: 201, description: 'Bulk attendance saved. Returns count of saved records.' })
  @ApiNotFoundResponse({ description: 'Group not found' })
  bulkCreate(@Body() dto: BulkAttendanceDto, @Request() req: any) {
    return this.attendanceService.bulkCreate(dto, req.user);
  }

  @Get('group/:groupId')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get attendance records for a group (optionally filter by date)' })
  @ApiQuery({ name: 'date', required: false, example: '2025-05-09', description: 'Filter by specific date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Attendance records ordered by date desc, student name asc' })
  findByGroup(@Param('groupId') groupId: string, @Query('date') date?: string) {
    return this.attendanceService.findByGroup(+groupId, date);
  }

  @Get('group/:groupId/monthly')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Monthly attendance summary for a group (present/absent/late per student)' })
  @ApiQuery({ name: 'month', required: false, example: '2025-05', description: 'YYYY-MM (defaults to current month)' })
  @ApiResponse({ status: 200, description: 'Monthly stats: present, absent, late count per student' })
  @ApiNotFoundResponse({ description: 'Group not found' })
  getMonthlyStats(@Param('groupId') groupId: string, @Query('month') month?: string) {
    const m = month ?? new Date().toISOString().slice(0, 7);
    return this.attendanceService.getMonthlyStats(+groupId, m);
  }

  @Get('student/:studentId')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get full attendance history for a student across all groups' })
  @ApiResponse({ status: 200, description: 'Student attendance history ordered by date desc' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.attendanceService.findByStudent(+studentId);
  }

  @Patch(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Update attendance status (present/absent/late)' })
  @ApiResponse({ status: 200, description: 'Attendance status updated' })
  @ApiNotFoundResponse({ description: 'Attendance record not found' })
  update(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Delete attendance record' })
  @ApiResponse({ status: 200, description: 'Attendance record deleted' })
  @ApiNotFoundResponse({ description: 'Attendance record not found' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}
