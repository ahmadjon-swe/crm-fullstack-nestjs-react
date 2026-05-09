import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyAuthDto } from './dto/verify-auth.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RolesAdmin } from 'src/shared/enums/roles.enum';

@ApiTags("Admins")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Create admin (superadmin only)' })
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login — sends OTP to email' })
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify OTP — returns tokens' })
  verify(@Body() verifyAuthDto: VerifyAuthDto) {
    return this.authService.verify(verifyAuthDto);
  }

  @Post('refresh/:id')
  @ApiOperation({ summary: 'Refresh access token' })
  refreshTokens(@Param('id') id: string, @Body('refresh_token') refresh_token: string) {
    return this.authService.refreshTokens(+id, refresh_token);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get all admins' })
  findAll() {
    return this.authService.findAll();
  }

  @Get('deleted')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get deleted admins' })
  findAllDeleted() {
    return this.authService.findAllDeleted();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get admin by id' })
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Update admin' })
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Soft delete admin' })
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  @Patch(':id/restore')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Restore deleted admin' })
  unremove(@Param('id') id: string) {
    return this.authService.unremove(+id);
  }
}
