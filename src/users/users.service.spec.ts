// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersService } from './users.service';

// describe('UsersService', () => {
//   let service: UsersService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UsersService],
//     }).compile();

//     service = module.get<UsersService>(UsersService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });

import { UsersService } from './users.service';
import { UserRepository } from './users.repository';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { User } from './entities/user.entity';
import { TestBed } from '@automock/jest';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UsersService).compile();

    usersService = unit;
    userRepository = unitRef.get(UserRepository);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: RegisterUserDto = {
      username: 'test_user',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should save a new user', async () => {
      userRepository.save.mockResolvedValue(createUserDto as User);
      const savedUser = await usersService.register(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(createUserDto);
      expect(savedUser).toEqual(createUserDto);
    });
  });
});
