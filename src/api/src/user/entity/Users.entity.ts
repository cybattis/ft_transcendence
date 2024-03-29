import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Game } from '../../game/entity/Game.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 15, unique: true })
  nickname: string;

  @Column({ type: 'varchar', length: 30, select: false, default: "" })
  firstname: string;

  @Column({ type: 'varchar', length: 30, select: false, default: "" })
  lastname: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'boolean', select: true })
  IsIntra: boolean;

  @Column({ type: 'varchar', length: 100, select: false, default: "" })
  password: string;

  @Column({ default: false, nullable: false })
  isVerified: boolean;

  @Column({ default: false, nullable: false })
  authActivated: boolean;

  @Column({ default: false, nullable: false })
  online: boolean;

  @Column({ default: false, nullable: false })
  inGame: boolean;

  // User data ans stats
  // ============================================================
  @CreateDateColumn({ select: true })
  creationDate: Date;

  @UpdateDateColumn({ select: true })
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
    eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable()
  games: Game[];

  @Column({ type: 'integer', default: 0 })
  totalGameWon: number;

  // Friends
  // ============================================================
  @Column('integer', { array: true, default: [] })
  friendsId: number[];

  @Column('integer', { array: true, default: [] })
  requestedId: number[];

  @Column('varchar', { array: true, default: [] })
  blockedChat: string[];

  @Column('integer', { array: true, default: [] })
  blockedId: number[];

  @Column('integer', { array: true, default: [] })
  blockedById: number[];

  // Chat
  // ============================================================
  @Column('varchar', { array: true, default: [] })
  invites: string[];

  @Column('text', { array: true, default: [] })
  joinChannel: string[];

  @Column('text', { array: true, default: [] })
  chans: string[];

  @Column('int', { array: true, default: [] })
  invitesId: number[];

  // Customisation
  // ============================================================
  @Column({ type: 'varchar', length: 6, default: 'ffffff' })
  paddleColor: string;

  @Column({ type: 'varchar', default: 'Normal' })
  backgroundColor: string;
}
