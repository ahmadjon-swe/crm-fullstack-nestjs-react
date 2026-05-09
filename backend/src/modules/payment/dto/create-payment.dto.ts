import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, Matches } from 'class-validator';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsNumber()
  student_id: number;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ example: 'May payment' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2025-05', description: 'YYYY-MM format' })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Month must be in YYYY-MM format' })
  month: string;
}
