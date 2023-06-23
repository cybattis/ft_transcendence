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

  @Column({ type: 'varchar', length: 30, unique: true })
  nickname: string;

  @Column({ type: 'varchar', length: 30, select: false, nullable: true })
  firstname: string;

  @Column({ type: 'varchar', length: 30, select: false, nullable: true })
  lastname: string;

  @Column({ type: 'varchar', length: 100, unique: true, select: false })
  email: string;

  @Column({ type: 'boolean', select: false })
  IsIntra: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true, select: false })
  password: string;

  @Column({ default: false, nullable: true })
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
  @ManyToMany(() => Game, (game: Game) => game.players, {
    eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable()
  games: Game[];

  @Column({ type: 'integer', default: 0 })
  totalGameWon: number;
}
