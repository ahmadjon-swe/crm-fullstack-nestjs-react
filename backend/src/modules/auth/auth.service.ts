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
import { jwtConstants } from 'src/shared/constants/jwt.contstant';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private authRepo: Repository<Auth>,
    private jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const { email, name, username, password } = createAuthDto;

    const foundAdmin = await this.authRepo.findOne({ where: [{ email }, { username }] });
    if (foundAdmin) throw new BadRequestException('Username or email already exists');

    const hash = await bcrypt.hash(password, 12);
    const admin = this.authRepo.create({ name, email, username, password: hash });
    await this.authRepo.save(admin);
    return { message: 'Admin added successfully' };
  }

  async generateToken(admin: Auth) {
    const payload = { id: admin.id, name: admin.name, role: admin.role, email: admin.email };
    const access_token = this.jwtService.sign(payload, {
      secret: jwtConstants.access_secret,
      expiresIn: '30m',
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret: jwtConstants.refresh_secret,
      expiresIn: '15d',
    });
    return { access_token, refresh_token };
  }

  async login(loginAuthDto: LoginAuthDto) {
    const { login, password } = loginAuthDto;
    const foundAdmin = await this.authRepo.findOne({
      where: [{ email: login }, { username: login }],
    });
    if (!foundAdmin) throw new BadRequestException('Admin not found');

    const check = await bcrypt.compare(password, foundAdmin.password);
    if (!check) throw new BadRequestException('Wrong password');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    foundAdmin.otp = otp;
    foundAdmin.otp_time = Date.now() + 120000;
    await this.authRepo.save(foundAdmin);

    // TODO: send OTP via nodemailer
    console.log(`OTP for ${foundAdmin.email}: ${otp}`);
    return { message: 'Please check your email for OTP' };
  }

  async verify(verifyAuthDto: VerifyAuthDto) {
    const { login, otp } = verifyAuthDto;
    const foundAdmin = await this.authRepo.findOne({
      where: [{ email: login }, { username: login }],
    });
    if (!foundAdmin) throw new NotFoundException('Login not found');
    if (!foundAdmin.otp_time || foundAdmin.otp_time < Date.now())
      throw new RequestTimeoutException('OTP expired');
    if (!foundAdmin.otp || foundAdmin.otp !== otp)
      throw new BadRequestException('OTP is incorrect');

    const { access_token, refresh_token } = await this.generateToken(foundAdmin);
    foundAdmin.otp = "";
    foundAdmin.otp_time = 0;
    foundAdmin.refresh_token = refresh_token;
    await this.authRepo.save(foundAdmin);

    return { message: 'Logged in successfully', token: { access_token, refresh_token } };
  }

  async refreshTokens(id: number, refresh_token: string) {
    const foundAdmin = await this.authRepo.findOne({ where: { id } });
    if (!foundAdmin) throw new NotFoundException('Admin not found');
    if (!foundAdmin.refresh_token || foundAdmin.refresh_token !== refresh_token)
      throw new UnauthorizedException('Refresh token is incorrect or expired');

    try {
      await this.jwtService.verifyAsync(refresh_token, { secret: jwtConstants.refresh_secret });
    } catch {
      throw new UnauthorizedException();
    }

    const tokens = await this.generateToken(foundAdmin);
    foundAdmin.refresh_token = tokens.refresh_token;
    await this.authRepo.save(foundAdmin);
    return tokens;
  }

  async findAll() {
    return this.authRepo.find() || [];
  }

  async findAllDeleted() {
    return this.authRepo.find({ where: { deletedAt: Not(IsNull()) }, withDeleted: true }) || [];
  }

  async findOne(id: number) {
    const foundAdmin = await this.authRepo.findOne({ where: { id }, withDeleted: true });
    if (!foundAdmin) throw new NotFoundException('Admin not found');
    return foundAdmin;
  }

  async update(id: number, updateAuthDto: UpdateAuthDto) {
    const foundAdmin = await this.findOne(id);
    if (updateAuthDto.password) {
      updateAuthDto.password = await bcrypt.hash(updateAuthDto.password, 12);
    }
    Object.assign(foundAdmin, updateAuthDto);
    return this.authRepo.save(foundAdmin);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.authRepo.softDelete(id);
    return { message: 'Admin deleted' };
  }

  async unremove(id: number) {
    const foundAdmin = await this.authRepo.findOne({ where: { id }, withDeleted: true });
    if (!foundAdmin) throw new NotFoundException('Admin not found');
    foundAdmin.deletedAt = undefined;
    await this.authRepo.save(foundAdmin);
    return { message: 'Admin restored' };
  }
}
