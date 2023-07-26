import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';
  
@Entity()
export class GameChat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true})
  channel: string;

  @Column('text', { array: true, default: [] })
  users: string[];

  @Column('text', { array: true, default: [] })
  messages: string[];

  @Column('text', { array: true, default: [] })
  emitter: string[];
}