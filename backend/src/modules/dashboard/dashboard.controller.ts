import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesAdmin } from 'src/shared/enums/roles.enum';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Main dashboard stats: groups, teachers, students, left count, this month stats' })
  @ApiResponse({
    status: 200,
    description: 'Returns totalGroups, totalTeachers, totalStudents, totalLeftStudents, newStudentsThisMonth, leftStudentsThisMonth',
  })
  getMainStats() {
    return this.dashboardService.getMainStats();
  }

  @Get('monthly')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Monthly student stats for last 12 months (bar chart data)' })
  @ApiResponse({
    status: 200,
    description: 'Array of 12 months with label, year, month, newStudents, activeStudents, leftStudents, leftPercent',
  })
  getMonthlyStudentStats() {
    return this.dashboardService.getMonthlyStudentStats();
  }
}
