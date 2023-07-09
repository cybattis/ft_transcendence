import {
Entity,
Column,
PrimaryGeneratedColumn,
} from 'typeorm';
  
@Entity()
export class Channel {
@PrimaryGeneratedColumn()
id: number;

@Column({ type: 'varchar'})
channel: string;

@Column({ type: 'varchar'})
status: string;

@Column({ type: 'varchar'})
users: string;

@Column({ type: 'varchar'})
owner: string;

@Column({ type: 'varchar'})
operator: string;

@Column({ type: 'varchar'})
ban: string;

@Column({ type: 'varchar'})
password: string;
}