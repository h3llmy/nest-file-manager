import { FindOneOptions } from 'typeorm';

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

// Filter type to handle both regular and nested filters
type Filter<T> = {
  [P in keyof T]?: T[P] extends object ? Filter<T[P]> : T[P];
};

/**
 * Interface representing the pagination payload.
 */
export interface IPaginationPayload<T> {
  /**
   * The page number (1-based index).
   */
  page?: number;
  /**
   * The number of items per page.
   */
  limit?: number;
  /**
   * Search criteria.
   */
  search?: Filter<T>;
  /**
   * Additional filters.
   */
  filters?: Filter<T>;
  /**
   * Ordering criteria.
   */
  orderBy?: { [P in keyof T]?: SortDirection };
  /**
   * re;atopm foe;d.
   */
  relations?: FindOneOptions<T>['relations'];
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
