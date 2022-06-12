import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    const users = await this.usersService.find(email);

    if (users.length) {
      throw new BadRequestException('This email is in use');
    }
    const salt = randomBytes(8).toString('hex');
    const hashedPassSalt = (await scrypt(password, salt, 32)) as Buffer;

    const resultPassword = salt + '.' + hashedPassSalt.toString('hex');

    return this.usersService.create(email, resultPassword);
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);

    if (!user) {
      throw new NotFoundException('This email is not registered');
    }

    const [salt, storedHash] = user.password.split('.');
    const hashedPassSalt = (await scrypt(password, salt, 32)) as Buffer;
    if (hashedPassSalt.toString('hex') !== storedHash) {
      throw new BadRequestException('Bad credentials');
    }

    return user;
  }
}
