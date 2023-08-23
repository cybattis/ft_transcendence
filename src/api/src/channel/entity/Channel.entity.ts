import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  channel: string;

  @Column({ type: 'varchar' })
  status: string;
  
  @Column({ type: 'varchar' })
  owner: string;

  @Column('text', { array: true })
  users: string[];

  @Column('text', { array: true })
  operator: string[];

  @Column('text', { array: true })
  ban: string[];

  @Column('text', { array: true })
  mute: string[];

  @Column({ type: 'varchar' })
  password: string;
}
