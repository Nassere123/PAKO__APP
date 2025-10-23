import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): { message: string; timestamp: string; version: string } {
    return {
      message: 'PAKO API est opérationnelle',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  getHealth(): { status: string; database: string; timestamp: string } {
    return {
      status: 'OK',
      database: 'PostgreSQL',
      timestamp: new Date().toISOString(),
    };
  }
}
