import { Injectable, Logger } from '@nestjs/common';
import { QueryOptimizerService } from './query-optimizer.service';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OptimizedBaseService {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected queryOptimizerService: QueryOptimizerService) {}

  async findById<T>(tableName: string, id: string): Promise<T | null> {
    const query = `SELECT * FROM ${tableName} WHERE id = $1`;
    const result = await this.queryOptimizerService.executeQuery<T[]>(query, [id]);
    return result.data.length > 0 ? result.data[0] : null;
  }

  async findAll<T>(
    tableName: string,
    options?: {
      where?: Record<string, any>;
      orderBy?: string;
      orderDirection?: 'ASC' | 'DESC';
      pagination?: PaginationOptions;
    }
  ): Promise<T[] | PaginatedResult<T>> {
    const { where = {}, orderBy, orderDirection = 'ASC', pagination } = options || {};
    
    let query = `SELECT * FROM ${tableName}`;
    const params: any[] = [];
    let paramIndex = 1;

    // Ajouter les conditions WHERE
    const whereConditions = Object.keys(where);
    if (whereConditions.length > 0) {
      const whereClause = whereConditions
        .map(key => `${key} = $${paramIndex++}`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      params.push(...whereConditions.map(key => where[key]));
    }

    // Ajouter l'ordre
    if (orderBy) {
      query += ` ORDER BY ${orderBy} ${orderDirection}`;
    }

    // Gestion de la pagination
    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit;
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(pagination.limit, offset);
    }

    const result = await this.queryOptimizerService.executeQuery<T[]>(query, params);
    
    if (pagination) {
      // Compter le total pour la pagination
      let countQuery = `SELECT COUNT(*) as total FROM ${tableName}`;
      if (whereConditions.length > 0) {
        const whereClause = whereConditions
          .map((_, index) => `${whereConditions[index]} = $${index + 1}`)
          .join(' AND ');
        countQuery += ` WHERE ${whereClause}`;
      }
      
      const countResult = await this.queryOptimizerService.executeQuery<{ total: string }[]>(
        countQuery,
        whereConditions.map(key => where[key])
      );
      
      const total = parseInt(countResult.data[0].total);
      const totalPages = Math.ceil(total / pagination.limit);
      
      return {
        data: result.data,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      };
    }

    return result.data;
  }

  async create<T>(tableName: string, data: Record<string, any>): Promise<T> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await this.queryOptimizerService.executeQuery<T[]>(query, values);
    return result.data[0];
  }

  async update<T>(
    tableName: string,
    id: string,
    data: Record<string, any>
  ): Promise<T | null> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    
    const result = await this.queryOptimizerService.executeQuery<T[]>(
      query,
      [...values, id]
    );
    
    return result.data.length > 0 ? result.data[0] : null;
  }

  async delete(tableName: string, id: string): Promise<boolean> {
    const query = `DELETE FROM ${tableName} WHERE id = $1`;
    const result = await this.queryOptimizerService.executeQuery(query, [id]);
    return result.data.rowCount > 0;
  }

  async softDelete(tableName: string, id: string): Promise<boolean> {
    const query = `
      UPDATE ${tableName}
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await this.queryOptimizerService.executeQuery(query, [id]);
    return result.data.rowCount > 0;
  }

  async count(tableName: string, where?: Record<string, any>): Promise<number> {
    let query = `SELECT COUNT(*) as total FROM ${tableName}`;
    const params: any[] = [];
    let paramIndex = 1;

    if (where && Object.keys(where).length > 0) {
      const whereConditions = Object.keys(where);
      const whereClause = whereConditions
        .map(key => `${key} = $${paramIndex++}`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      params.push(...whereConditions.map(key => where[key]));
    }

    const result = await this.queryOptimizerService.executeQuery<{ total: string }[]>(
      query,
      params
    );
    
    return parseInt(result.data[0].total);
  }

  async exists(tableName: string, where: Record<string, any>): Promise<boolean> {
    const count = await this.count(tableName, where);
    return count > 0;
  }

  async executeRawQuery<T = any>(
    query: string,
    params?: any[],
    options?: {
      timeout?: number;
      retries?: number;
    }
  ): Promise<T> {
    const result = await this.queryOptimizerService.executeQuery<T>(query, params, options);
    return result.data;
  }

  async executeTransaction<T>(
    callback: (service: OptimizedBaseService) => Promise<T>
  ): Promise<T> {
    const result = await this.queryOptimizerService.executeTransaction(async (client) => {
      // Créer une instance temporaire du service avec le client de transaction
      const tempService = new OptimizedBaseService(this.queryOptimizerService);
      return callback(tempService);
    });
    return result.data;
  }

  async bulkInsert<T>(
    tableName: string,
    data: Record<string, any>[],
    options?: {
      onConflict?: string;
      returning?: string[];
    }
  ): Promise<T[]> {
    if (data.length === 0) return [];

    const columns = Object.keys(data[0]);
    const values: any[] = [];
    const placeholders: string[] = [];
    let paramIndex = 1;

    data.forEach((row, rowIndex) => {
      const rowPlaceholders = columns.map(() => `$${paramIndex++}`).join(', ');
      placeholders.push(`(${rowPlaceholders})`);
      values.push(...columns.map(col => row[col]));
    });

    let query = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES ${placeholders.join(', ')}
    `;

    if (options?.onConflict) {
      query += ` ON CONFLICT ${options.onConflict}`;
    }

    if (options?.returning) {
      query += ` RETURNING ${options.returning.join(', ')}`;
    } else {
      query += ' RETURNING *';
    }

    const result = await this.queryOptimizerService.executeQuery<T[]>(query, values);
    return result.data;
  }

  async bulkUpdate<T>(
    tableName: string,
    data: Array<{ id: string; data: Record<string, any> }>,
    options?: {
      returning?: string[];
    }
  ): Promise<T[]> {
    if (data.length === 0) return [];

    const results: T[] = [];
    
    // Exécuter les mises à jour en lot
    for (const item of data) {
      const result = await this.update<T>(tableName, item.id, item.data);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }
}
