import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  dashboard(): string {
    return '<div>Dashboard</div><button>Click</button>';
  }
}
