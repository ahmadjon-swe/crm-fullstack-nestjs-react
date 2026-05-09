import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, Matches } from 'class-validator';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsNumber()
  student_id: number;

  @ApiProperty({ example: 500000, description: 'Amount to deposit (UZS)' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method', default: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: '2025-05', description: 'Payment month in YYYY-MM format' })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Month must be in YYYY-MM format' })
  month: string;

  @ApiProperty({ example: 'May payment', description: 'Optional description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
