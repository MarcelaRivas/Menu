import { Controller, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = new Map<string, number[]>();

/** Cuenta los intentos fallidos recientes por dirección. */
function recentFailures(ip: string): number[] {
  const now = Date.now();
  const list = (failures.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  failures.set(ip, list);
  return list;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: { ip?: string; socket?: { remoteAddress?: string } }) {
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'desconocida';
    if (recentFailures(ip).length >= MAX_FAILURES) {
      throw new HttpException('Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.', HttpStatus.TOO_MANY_REQUESTS);
    }
    try {
      const result = await this.auth.login(dto.email, dto.password);
      failures.delete(ip);
      return result;
    } catch (e) {
      recentFailures(ip).push(Date.now());
      failures.set(ip, recentFailures(ip));
      throw e;
    }
  }
}
