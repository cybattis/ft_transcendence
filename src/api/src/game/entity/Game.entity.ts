import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber } from 'class-validator';

export enum GameType {
  PRACTICE = 'Practice',
  CASUAL = 'Casual',
  RANKED = 'Ranked',
}

export enum GameMode {
  V1 = '1v1',
  V2 = '2v2',
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: GameType })
  type: GameType;

  @Column({ type: 'enum', enum: GameMode })
  mode: GameMode;

  @Column({ type: 'integer', default: 0 })
  players: number[];

  @Column({ type: 'integer', default: 0 })
  scoreP1: number;

  @Column({ type: 'integer', default: 0 })
  scoreP2: number;

  // Various stats
  // ============================================================
}
