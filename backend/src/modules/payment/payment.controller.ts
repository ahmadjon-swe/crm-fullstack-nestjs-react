import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesAdmin } from 'src/shared/enums/roles.enum';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('deposit')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Add payment (deposit) to student balance' })
  deposit(@Body() dto: CreatePaymentDto, @Request() req) {
    return this.paymentService.deposit(dto, req.user);
  }

  @Get()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get all payments' })
  findAll() {
    return this.paymentService.findAll();
  }

  @Get('monthly-report')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Monthly payment report (paid vs debt)' })
  @ApiQuery({ name: 'month', required: false, example: '2025-05', description: 'YYYY-MM, defaults to current month' })
  getMonthlyReport(@Query('month') month?: string) {
    return this.paymentService.getMonthlyReport(month);
  }

  @Get('student/:studentId')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get payment history for a student' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.paymentService.findByStudent(+studentId);
  }

  @Get(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get payment by id' })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Delete(':id')
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Delete payment (reverses balance)' })
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
