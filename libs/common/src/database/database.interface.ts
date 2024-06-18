import { FindOneOptions, FindOptionsWhere } from 'typeorm';

/**
 * Enum representing the sorting directions.
 */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type Relation = {
  name: string;
  nestedRelations?: Relation[];
};

export interface IPaginationPayload<T = any> extends FindOneOptions<T> {
  page?: number;
  limit?: number;
  search?: FindOptionsWhere<T>[] | FindOptionsWhere<T>;
}

/**
 * Interface representing the pagination response.
 */
export interface IPaginationResponse<T> {
  /**
   * The data for the current page.
   */
  data: T[];
  /**
   * The total number of data items across all pages.
   */
  totalData: number;
  /**
   * The total number of pages available.
   */
  totalPages: number;
  /**
   * The current page number (1-based index).
   */
  page: number;
  /**
   * The number of items per page.
   */
  limit: number;
}
