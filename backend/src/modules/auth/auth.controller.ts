import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags,
  ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse,
  ApiForbiddenResponse, ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyAuthDto } from './dto/verify-auth.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RolesAdmin } from 'src/shared/enums/roles.enum';

@ApiTags('Auth (Admins)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Public endpoints ────────────────────────────────────────────────────────

  @Post('login')
  @ApiOperation({ summary: 'Login — sends 6-digit OTP to email' })
  @ApiResponse({ status: 200, description: 'OTP sent to email. Valid 2 minutes.' })
  @ApiBadRequestResponse({ description: 'Admin not found or wrong password' })
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify OTP — returns access & refresh tokens' })
  @ApiResponse({ status: 200, description: 'Login successful, tokens returned' })
  @ApiBadRequestResponse({ description: 'OTP is incorrect' })
  @ApiResponse({ status: 408, description: 'OTP expired' })
  verify(@Body() verifyAuthDto: VerifyAuthDto) {
    return this.authService.verify(verifyAuthDto);
  }

  @Post('refresh/:id')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ schema: { properties: { refresh_token: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'New access & refresh tokens issued' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  refreshTokens(@Param('id') id: string, @Body('refresh_token') refresh_token: string) {
    return this.authService.refreshTokens(+id, refresh_token);
  }

  // ─── Protected: Any authenticated admin ─────────────────────────────────────

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({ status: 200, description: 'Returns current admin data' })
  @ApiUnauthorizedResponse({ description: 'Access token not provided or invalid' })
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }

  // ─── Protected: Superadmin only ──────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Create new admin (superadmin only)' })
  @ApiCreatedResponse({ description: 'Admin created successfully' })
  @ApiBadRequestResponse({ description: 'Username or email already exists / validation error' })
  @ApiUnauthorizedResponse({ description: 'Access token missing or invalid' })
  @ApiForbiddenResponse({ description: 'Only superadmin can create admins' })
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get all active admins (superadmin only)' })
  @ApiResponse({ status: 200, description: 'List of active admins' })
  @ApiUnauthorizedResponse({ description: 'Access token missing or invalid' })
  @ApiForbiddenResponse({ description: 'Only superadmin can view admin list' })
  findAll() {
    return this.authService.findAll();
  }

  @Get('deleted')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get soft-deleted admins (superadmin only)' })
  @ApiResponse({ status: 200, description: 'List of deleted admins' })
  @ApiForbiddenResponse({ description: 'Only superadmin can view deleted admins' })
  findAllDeleted() {
    return this.authService.findAllDeleted();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Get admin by ID (superadmin only)' })
  @ApiResponse({ status: 200, description: 'Admin data' })
  @ApiNotFoundResponse({ description: 'Admin with given ID not found' })
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Update admin data (superadmin only)' })
  @ApiResponse({ status: 200, description: 'Admin updated successfully' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiBadRequestResponse({ description: 'Username or email already taken' })
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Soft-delete admin (superadmin only)' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  @Patch(':id/restore')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesAdmin.SUPERADMIN)
  @ApiOperation({ summary: 'Restore soft-deleted admin (superadmin only)' })
  @ApiResponse({ status: 200, description: 'Admin restored successfully' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  restore(@Param('id') id: string) {
    return this.authService.restore(+id);
  }
}
