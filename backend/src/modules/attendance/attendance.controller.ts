import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Mark attendance for single student' })
  create(@Body() dto: CreateAttendanceDto, @Request() req) {
    return this.attendanceService.create(dto, req.user);
  }

  @Post('bulk')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Mark attendance for entire group on a day' })
  bulkCreate(@Body() dto: BulkAttendanceDto, @Request() req) {
    return this.attendanceService.bulkCreate(dto, req.user);
  }

  @Get('group/:groupId')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get attendance records for a group' })
  @ApiQuery({ name: 'date', required: false, example: '2025-05-08' })
  findByGroup(@Param('groupId') groupId: string, @Query('date') date?: string) {
    return this.attendanceService.findByGroup(+groupId, date);
  }

  @Get('group/:groupId/monthly')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Monthly attendance stats for group' })
  @ApiQuery({ name: 'month', required: false, example: '2025-05' })
  getMonthlyStats(@Param('groupId') groupId: string, @Query('month') month?: string) {
    const m = month ?? new Date().toISOString().slice(0, 7);
    return this.attendanceService.getMonthlyStats(+groupId, m);
  }

  @Get('student/:studentId')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get attendance history for a student' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.attendanceService.findByStudent(+studentId);
  }

  @Patch(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Update attendance status' })
  update(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Delete attendance record' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}
