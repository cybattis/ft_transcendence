import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  nickname: string;

  @Column({ type: 'varchar', length: 30 })
  firstname: string;

  @Column({ type: 'varchar', length: 30 })
  lastname: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'boolean' })
  IsIntra: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @Column({ default: true, nullable: true }) //TODO: change to false. This is for testing.
  isVerified: boolean;

  @Column({ default: false, nullable: true })
  authActivated: boolean;

  @Column({ default: false, nullable: true })
  online: boolean;

  @Column({ default: false, nullable: true })
  inGame: boolean;
}
