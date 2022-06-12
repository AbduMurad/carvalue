import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      find: (email: string) => {
        return Promise.resolve([
          { id: 1, email, password: 'password' } as User,
        ]);
      },
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'email@email.com',
          password: 'password',
        } as User);
      },
      // remove: () => {},
      // update: () => {}
    };

    fakeAuthService = {
      // signup: () => {}
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('email@email.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('email@email.com');
  });

  it('findUser returns a given user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
    expect(user.email).toEqual('email@email.com');
  });

  it('findUser throws NotFoundException if user not found with the given id', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('2')).rejects.toThrow(NotFoundException);
  });

  it('signIn updates session object and returns a user', async () => {
    const session = {};
    const user = await controller.signin(
      { email: 'email@email.com', password: 'password' },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session).toHaveProperty('userId', user.id);
  });
});
