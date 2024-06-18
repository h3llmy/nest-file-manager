import { ObjectLiteral, Repository } from 'typeorm';
import { IPaginationPayload, IPaginationResponse } from './database.interface';

export class DefaultRepository<T extends ObjectLiteral> extends Repository<T> {
  getTableName(): string {
    return (this.target as NewableFunction).name;
  }

  async findPagination({
    page = 1,
    limit = 10,
    where,
    order,
    relations,
    select,
    cache,
    lock,
    loadEagerRelations,
    loadRelationIds,
    relationLoadStrategy,
    withDeleted,
    search,
  }: IPaginationPayload<T>): Promise<IPaginationResponse<T>> {
    const skip = (page - 1) * limit;
    const findOptions: any = {
      skip,
      take: limit,
      where: where || {},
      order,
      relations,
      select,
      cache,
      lock,
      loadEagerRelations,
      loadRelationIds,
      relationLoadStrategy,
      withDeleted,
    };

    const [data, totalData] = await this.findAndCount(findOptions);
    const totalPages = Math.ceil(totalData / limit);

    return {
      totalData,
      totalPages,
      page,
      limit,
      data,
    };
  }
}
