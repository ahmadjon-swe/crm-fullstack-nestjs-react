import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Auth } from './entities/auth.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyAuthDto } from './dto/verify-auth.dto';
import { jwtConstants } from 'src/shared/constants/jwt.constant';
import { otpSender } from 'src/shared/utils/node-mailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private authRepo: Repository<Auth>,
    private jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const { email, name, username, password, role } = createAuthDto;

    const foundAdmin = await this.authRepo.findOne({ where: [{ email }, { username }] });
    if (foundAdmin) throw new BadRequestException('Username or email already exists');

    const hash = await bcrypt.hash(password, 12);
    const admin = this.authRepo.create({ name, email, username, password: hash, role });
    await this.authRepo.save(admin);
    return { message: 'Admin created successfully' };
  }

  async generateToken(admin: Auth) {
    const payload = { id: admin.id, name: admin.name, role: admin.role, email: admin.email };
    const access_token = this.jwtService.sign(payload, {
      secret: jwtConstants.access_secret,
      expiresIn: jwtConstants.access_expires,
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret: jwtConstants.refresh_secret,
      expiresIn: jwtConstants.refresh_expires,
    });
    return { access_token, refresh_token };
  }

  async login(loginAuthDto: LoginAuthDto) {
    const { login, password } = loginAuthDto;
    const foundAdmin = await this.authRepo
      .createQueryBuilder('a')
      .addSelect(['a.password', 'a.otp', 'a.otp_time'])
      .where('a.username = :login OR a.email = :login', { login })
      .getOne();

    if (!foundAdmin) throw new BadRequestException('Admin not found');

    const check = await bcrypt.compare(password, foundAdmin.password);
    if (!check) throw new BadRequestException('Wrong password');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    foundAdmin.otp = otp;
    foundAdmin.otp_time = Date.now() + 120000; // 2 minutes
    await this.authRepo.save(foundAdmin);

    await otpSender(otp, foundAdmin.email)
    // TODO: send via nodemailer — dev mode: print to console
    console.log(`[DEV OTP] for ${foundAdmin.email}: ${otp}`);



    return {
      message: 'OTP sent to your email. Valid for 2 minutes.',
      // dev_otp: otp, // Remove in production
    };
  }

  async verify(verifyAuthDto: VerifyAuthDto) {
    const { login, otp } = verifyAuthDto;
    const foundAdmin = await this.authRepo
      .createQueryBuilder('a')
      .addSelect(['a.otp', 'a.otp_time', 'a.refresh_token'])
      .where('a.username = :login OR a.email = :login', { login })
      .getOne();

    if (!foundAdmin) throw new NotFoundException('Admin not found');
    if (!foundAdmin.otp_time || foundAdmin.otp_time < Date.now())
      throw new RequestTimeoutException('OTP expired. Please login again.');
    if (!foundAdmin.otp || foundAdmin.otp !== otp)
      throw new BadRequestException('Incorrect OTP code');

    const { access_token, refresh_token } = await this.generateToken(foundAdmin);
    foundAdmin.otp = '';
    foundAdmin.otp_time = 0;
    foundAdmin.refresh_token = refresh_token;
    await this.authRepo.save(foundAdmin);

    return {
      message: 'Logged in successfully',
      data: {
        id: foundAdmin.id,
        name: foundAdmin.name,
        email: foundAdmin.email,
        role: foundAdmin.role,
      },
      tokens: { access_token, refresh_token },
    };
  }

  async refreshTokens(id: number, refresh_token: string) {
    const foundAdmin = await this.authRepo
      .createQueryBuilder('a')
      .addSelect(['a.refresh_token'])
      .where('a.id = :id', { id })
      .getOne();

    if (!foundAdmin) throw new NotFoundException('Admin not found');
    if (!foundAdmin.refresh_token || foundAdmin.refresh_token !== refresh_token)
      throw new UnauthorizedException('Invalid or expired refresh token');

    try {
      await this.jwtService.verifyAsync(refresh_token, { secret: jwtConstants.refresh_secret });
    } catch {
      throw new UnauthorizedException('Refresh token expired. Please login again.');
    }

    const tokens = await this.generateToken(foundAdmin);
    foundAdmin.refresh_token = tokens.refresh_token;
    await this.authRepo.save(foundAdmin);
    return { tokens };
  }

  async getMe(id: number) {
    const admin = await this.authRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async findAll() {
    return this.authRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findAllDeleted() {
    return this.authRepo.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
      order: { deletedAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const foundAdmin = await this.authRepo.findOne({ where: { id }, withDeleted: true });
    if (!foundAdmin) throw new NotFoundException('Admin not found');
    return foundAdmin;
  }

  async update(id: number, updateAuthDto: UpdateAuthDto) {
    const foundAdmin = await this.findOne(id);
    if (updateAuthDto.username && updateAuthDto.username !== foundAdmin.username) {
      const exists = await this.authRepo.findOne({ where: { username: updateAuthDto.username } });
      if (exists) throw new BadRequestException('Username already taken');
    }
    if (updateAuthDto.email && updateAuthDto.email !== foundAdmin.email) {
      const exists = await this.authRepo.findOne({ where: { email: updateAuthDto.email } });
      if (exists) throw new BadRequestException('Email already registered');
    }
    if (updateAuthDto.password) {
      updateAuthDto.password = await bcrypt.hash(updateAuthDto.password, 12);
    }
    Object.assign(foundAdmin, updateAuthDto);
    await this.authRepo.save(foundAdmin);
    return { message: 'Admin updated successfully' };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.authRepo.softDelete(id);
    return { message: 'Admin deleted successfully' };
  }

  async restore(id: number) {
    const foundAdmin = await this.authRepo.findOne({ where: { id }, withDeleted: true });
    if (!foundAdmin) throw new NotFoundException('Admin not found');
    foundAdmin.deletedAt = undefined;
    await this.authRepo.save(foundAdmin);
    return { message: 'Admin restored successfully' };
  }
}
