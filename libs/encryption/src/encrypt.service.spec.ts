// src/encrypt.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';
import * as bcrypt from 'bcrypt';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should generate a hashed password', () => {
      const password = 'password123';
      const hashedPassword = service.hash(password);

      expect(bcrypt.compareSync(password, hashedPassword)).toBe(true);
      expect(hashedPassword).not.toBe(password);
    });
  });

  describe('match', () => {
    it('should return true if password matches hashed password', () => {
      const password = 'password123';
      const hashedPassword = bcrypt.hashSync(password, 10);

      expect(service.match(password, hashedPassword)).toBe(true);
    });

    it('should return false if password does not match hashed password', () => {
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = bcrypt.hashSync(password, 10);

      expect(service.match(wrongPassword, hashedPassword)).toBe(false);
    });
  });
});
