import { ObjectLiteral, Repository } from 'typeorm';
import { IPaginationPayload, IPaginationResponse } from './database.interface';

/**
 * Custom repository class with pagination, search, filters, and ordering support.
 * @typeparam T - The entity type.
 */
export class DefaultRepository<T extends ObjectLiteral> extends Repository<T> {
  getTableName(): string {
    return (this.target as NewableFunction).name;
  }
  /**
   * Finds entities with pagination, search, filters, and ordering.
   * @param payload - The pagination payload.
   * @returns A promise that resolves to the paginated result.
   */
  async findPagination({
    page = 1,
    limit = 10,
    search,
    filters,
    orderBy,
  }: IPaginationPayload<T>): Promise<IPaginationResponse<T>> {
    const tableName = this.getTableName();
    // Create a query builder

    const queryBuilder = this.createQueryBuilder(tableName);

    // Apply search criteria if provided
    if (search) {
      Object.entries(search).forEach(([key, value]) => {
        queryBuilder.orWhere(`${tableName}.${key} LIKE :${key}`, {
          [key]: `%${value}%`,
        });
      });
    }

    // Apply additional filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        queryBuilder.andWhere(`${tableName}.${key} = :${key}`, {
          [key]: value,
        });
      });
    }

    // Apply ordering if provided
    if (orderBy) {
      Object.entries(orderBy).forEach(([key, value]) => {
        queryBuilder.orderBy(`${tableName}.${key}`, value);
      });
    }

    // Execute query with pagination
    const [data, totalData] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Calculate total pages
    const totalPages = Math.ceil(totalData / limit);

    // Return paginated result
    return {
      totalData,
      totalPages,
      page,
      limit,
      data,
    };
  }
}
