import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
  OneToMany
} from 'typeorm';
import { Game } from '../../game/entity/Game.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  nickname: string;

  @Column({ type: 'varchar', length: 30, select: false })
  firstname: string;

  @Column({ type: 'varchar', length: 30, select: false })
  lastname: string;

  @Column({ type: 'varchar', length: 100, unique: true, select: false })
  email: string;

  @Column({ type: 'boolean', select: true })
  IsIntra: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true, select: false })
  password: string;

  @Column({ default: false, nullable: true }) //TODO: if true change to false, this is for testing.
  isVerified: boolean;

  @Column({ default: false, nullable: true })
  authActivated: boolean;

  @Column({ default: false, nullable: true })
  online: boolean;

  @Column({ default: false, nullable: true })
  inGame: boolean;

  // User data ans stats
  // ============================================================
  @CreateDateColumn({ select: false })
  creationDate: Date;

  @UpdateDateColumn({ select: false })
  updateDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  avatarUrl: string;

  @Column({ type: 'integer', default: 0 })
  xp: number;

  @Column({ type: 'integer', default: 1 })
  level: number;

  @Column({ type: 'integer', default: 1000 })
  ranking: number;

  // Player games
  // ============================================================
  @ManyToMany(() => Game, (game: Game) => game.players, {
    cascade: true,
  })
  @JoinTable()
  games: Game[];

  @Column({ type: 'integer', default: 0 })
  totalGameWon: number;

  // Friends
  // ============================================================
  @Column('int', { array: true, default: [] })
  friendsId: number[];

  @Column('int', { array: true, default: [] })
  requestedId: number[];

  @Column('int', { array: true, default: [] })
  blockedId: number[];

  @Column({type: 'varchar', default: '' })
  websocket: string;
}