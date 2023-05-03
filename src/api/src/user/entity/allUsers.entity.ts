import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AllUsers {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 30, unique: true})
    username: string;

    @Column({type: 'varchar', length: 100, unique: true})
    email: string;
}