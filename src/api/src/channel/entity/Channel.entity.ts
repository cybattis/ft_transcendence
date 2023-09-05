import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BanType } from '../channel.structure';

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
  banName: string[];

  @Column('text', { array: true })
  ban: BanType[];

  @Column('text', { array: true })
  mute: string[];

  @Column('text', { array: true })
  muteTime: Date[];

  @Column({ type: 'varchar' })
  password: string;
}
