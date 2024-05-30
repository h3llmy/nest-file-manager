/**
 * Enum representing the sorting directions.
 */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

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
  search?: Partial<T>;
  /**
   * Additional filters.
   */
  filters?: Partial<T>;
  /**
   * Ordering criteria.
   */
  orderBy?: { [P in keyof T]?: SortDirection };
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
