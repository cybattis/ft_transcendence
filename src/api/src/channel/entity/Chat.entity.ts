import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';
  
@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar'})
  channel: string;

  @Column({ type: 'varchar'})
  content: string;

  @Column({ type: 'varchar', length: 40})
  emitter: string;
}