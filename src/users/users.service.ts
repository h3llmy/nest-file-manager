import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { UserRepository } from './users.repository';
import { User } from './entities/user.entity';
import { PaginationUserDto } from './dto/pagination-user.dto';
import { IPaginationPayload, IPaginationResponse } from '@app/common';
import { FindOptionsRelations, ILike, In } from 'typeorm';

/**
 * UsersService provides operations for managing user data.
 */
@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Registers a new user.
   * @param createUserDto - Data Transfer Object containing user registration information.
   * @returns The created user entity.
   */
  async register(createUserDto: RegisterUserDto): Promise<User> {
    return this.userRepository.save(createUserDto);
  }

  /**
   * Retrieves a paginated list of users based on the given criteria.
   * @param paginationPayload - Data Transfer Object containing pagination and search parameters.
   * @returns A paginated response containing the user entities.
   */
  findAllPagination(
    paginationPayload: PaginationUserDto,
  ): Promise<IPaginationResponse<User>> {
    const { search, ...paginationQuery } = paginationPayload;
    const query: IPaginationPayload<User> = {
      ...paginationQuery,
    };
    if (search) {
      query.where = {
        username: ILike(search),
        email: ILike(search),
      };
    }

    return this.userRepository.findPagination(query);
  }

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user entity.
   * @throws NotFoundException if the user with the given ID is not found.
   */
  async findOne(
    id: string,
    relations?: FindOptionsRelations<User>,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: relations,
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async findMany(ids: string[]) {
    return this.userRepository.find({
      where: { id: In(ids) },
    });
  }

  /**
   * Retrieves a user by their email.
   * @param email - The email of the user to retrieve.
   * @returns The user entity.
   * @throws NotFoundException if the user with the given email is not found.
   */
  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'username',
        'emailVerifiedAt',
        'password',
        'role',
      ],
    });
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  /**
   * Updates a user by their ID.
   * @param id - The ID of the user to update.
   * @param updateUserDto - Partial user entity containing the update data.
   * @param failedMessage - Custom error message if the update fails.
   * @returns The updated user entity.
   * @throws BadRequestException if the update operation fails.
   */
  async update(
    id: string,
    updateUserDto: Partial<User>,
    failedMessage?: string,
  ) {
    const updatedUser = await this.userRepository.update({ id }, updateUserDto);
    if (updatedUser.affected < 1) {
      throw new BadRequestException(
        failedMessage ?? 'Failed to update profile',
      );
    }
    return updatedUser;
  }

  /**
   * Deletes all users from the database.
   * @returns The result of the delete operation.
   */
  deleteAll() {
    return this.userRepository.delete({});
  }
}
