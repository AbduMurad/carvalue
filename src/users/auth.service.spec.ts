import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

let service: AuthService;
let fakeUsersService: Partial<UsersService>;

describe('AuthService', () => {
  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashe password', async () => {
    const user = await service.signup('tt@tt.t', 'pass');
    expect(user.password).not.toEqual('pass');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if the email used to sign up is in use', async () => {
    await service.signup('email@email.com', 'password');
    await expect(service.signup('email@email.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws an error if signed in with unused email', async () => {
    await expect(service.signin('email@email.com', 'password')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws an error if invalid password is provided to sign in', async () => {
    await service.signup('email@email.com', 'password');

    await expect(service.signin('email@email.com', 'pass')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns a user if correct credentials provided', async () => {
    await service.signup('tt@tt.t', 'pass');

    await expect(service.signin('tt@tt.t', 'pass')).resolves;
  });
});
