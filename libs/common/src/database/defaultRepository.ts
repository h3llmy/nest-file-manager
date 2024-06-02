import { ObjectLiteral, Repository } from 'typeorm';
import { IPaginationPayload, IPaginationResponse } from './database.interface';

export class DefaultRepository<T extends ObjectLiteral> extends Repository<T> {
  getTableName(): string {
    return (this.target as NewableFunction).name;
  }

  // TODO: add nested relation default repository
  async findPagination({
    page = 1,
    limit = 10,
    search,
    filters,
    orderBy,
    relations,
  }: IPaginationPayload<T>): Promise<IPaginationResponse<T>> {
    const tableName = this.getTableName();
    const queryBuilder = this.createQueryBuilder(tableName);

    if (relations) {
      this.addNestedRelations(queryBuilder, tableName, relations as string[]);
    }

    if (search) {
      this.applySearch(queryBuilder, search, tableName);
    }

    if (filters) {
      this.applyFilters(queryBuilder, filters, tableName);
    }

    if (orderBy) {
      Object.entries(orderBy).forEach(([key, value]) => {
        queryBuilder.orderBy(`${tableName}.${key}`, value);
      });
    }

    const [data, totalData] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalData / limit);

    return {
      totalData,
      totalPages,
      page,
      limit,
      data,
    };
  }

  private applyFilters(
    queryBuilder: any,
    filters: any,
    tableName: string,
    prefix = '',
  ): void {
    Object.entries(filters).forEach(([key, value]) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        this.applyFilters(queryBuilder, value, tableName, newPrefix);
      } else {
        const parameterName = prefix
          ? `${prefix}.${key}`.replace(/\./g, '_')
          : key;
        const columnName = prefix ? `${prefix}.${key}` : `${tableName}.${key}`;
        queryBuilder.andWhere(`${columnName} = :${parameterName}`, {
          [parameterName]: value,
        });
      }
    });
  }

  private applySearch(
    queryBuilder: any,
    search: any,
    tableName: string,
    prefix = '',
  ): void {
    Object.entries(search).forEach(([key, value]) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        this.applySearch(queryBuilder, value, tableName, newPrefix);
      } else {
        const parameterName = prefix
          ? `${prefix}_${key}`.replace(/\./g, '_')
          : key;
        const columnName = prefix ? `${prefix}.${key}` : `${tableName}.${key}`;
        queryBuilder.orWhere(`${columnName} LIKE :${parameterName}`, {
          [parameterName]: `%${value}%`,
        });
      }
    });
  }

  addNestedRelations(
    queryBuilder: any,
    tableName: string,
    relations: string[],
  ) {
    relations.forEach((relation: string) => {
      const [firstRelation, ...nestedRelations] = relation.split('.'); // Split nested relations
      queryBuilder.leftJoinAndSelect(
        `${tableName}.${firstRelation}`,
        firstRelation,
      );

      // If there are nested relations, recursively add them
      if (nestedRelations.length > 0) {
        this.addNestedRelations(queryBuilder, firstRelation, [
          nestedRelations.join('.'),
        ]);
      }
    });
  }
}
