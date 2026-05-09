import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiResponse,
  ApiBadRequestResponse, ApiNotFoundResponse, ApiForbiddenResponse,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Deposit money to student balance (manual payment entry)' })
  @ApiResponse({ status: 201, description: 'Payment recorded and balance updated' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  deposit(@Body() dto: CreatePaymentDto, @Request() req: any) {
    return this.paymentService.deposit(dto, req.user);
  }

  @Get()
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get all payment records (newest first)' })
  @ApiResponse({ status: 200, description: 'List of all payments' })
  findAll() {
    return this.paymentService.findAll();
  }

  @Get('monthly-report')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Monthly payment report — who paid and who has debt' })
  @ApiQuery({ name: 'month', required: false, example: '2025-05', description: 'YYYY-MM (defaults to current month)' })
  @ApiResponse({ status: 200, description: 'Report with paid/debt status for each student' })
  getMonthlyReport(@Query('month') month?: string) {
    return this.paymentService.getMonthlyReport(month);
  }

  @Get('student/:studentId')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get full payment history for a specific student' })
  @ApiResponse({ status: 200, description: 'Payment history for student' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.paymentService.findByStudent(+studentId);
  }

  @Get(':id')
  @Roles(RolesAdmin.ADMIN, RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment data' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Delete(':id')
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Delete payment and reverse balance (superadmin only)' })
  @ApiResponse({ status: 200, description: 'Payment deleted and balance reversed' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  @ApiForbiddenResponse({ description: 'Only superadmin can delete payments' })
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
