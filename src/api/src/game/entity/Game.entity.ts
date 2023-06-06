import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entity/Users.entity';
import { GameMode, GameStatus, GameType } from '../../type/game.type';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  creationDate: Date;

  @Column({ type: 'enum', enum: GameType })
  type: GameType;

  @Column({ type: 'enum', enum: GameMode })
  mode: GameMode;

  @Column({ type: 'json', nullable: true })
  @ManyToMany(() => User, (user: User) => user.games)
  players: User[];

  @Column({ type: 'simple-array', nullable: true })
  ids: number[];

  @Column({ type: 'integer', default: 0 })
  scoreP1: number;

  @Column({ type: 'integer', default: 0 })
  scoreP2: number;

  @Column({ type: 'enum', enum: GameStatus })
  status: GameStatus;

  // Various stats
  // ============================================================
}
