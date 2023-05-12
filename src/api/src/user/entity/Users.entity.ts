import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Game } from '../../game/entity/Game.entity';

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

  // User data ans stats
  // ============================================================
  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  avatarUrl: string;

  @Column({ type: 'integer', default: 0 })
  xp: number;

  // Player games
  @ManyToMany(() => Game, (game: Game) => game.players)
  @JoinTable()
  games: Game[];
}
