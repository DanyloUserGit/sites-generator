import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async register(login: string, password: string): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = this.adminRepository.create({
      login,
      password: hashedPassword,
    });
    return await this.adminRepository.save(admin);
  }

  async validateUser(login: string, password: string): Promise<any> {
    const admin = await this.adminRepository.findOneBy({ login });
    if (!admin) {
      throw new UnauthorizedException('Invalid login');
    }

    const passwordValid = await bcrypt.compare(password, admin.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return admin;
  }

  async login(
    login: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.validateUser(login, password);

    const payload = { sub: user.id, login: user.login };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
