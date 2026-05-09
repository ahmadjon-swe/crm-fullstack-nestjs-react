import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create group' })
  create(@Body() dto: CreateGroupDto) {
    return this.groupService.create(dto);
  }

  @Get()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get all groups' })
  findAll() {
    return this.groupService.findAll();
  }

  @Get(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get group by id' })
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Patch(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Update group' })
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Soft delete group' })
  remove(@Param('id') id: string) {
    return this.groupService.remove(+id);
  }

  @Post(':id/students/:studentId')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Add student to group' })
  addStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.groupService.addStudent(+id, +studentId);
  }

  @Delete(':id/students/:studentId')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Remove student from group (clears attendance)' })
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.groupService.removeStudent(+id, +studentId);
  }

  @Get(':id/attendance')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get attendance for group by date' })
  @ApiQuery({ name: 'date', required: false, example: '2025-05-08' })
  getAttendanceByDate(@Param('id') id: string, @Query('date') date?: string) {
    return this.groupService.getAttendanceByDate(+id, date ?? "");
  }
}
