import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 30, unique: true})
    nickname: string;

    @Column({type: 'varchar', length: 30})
    firstname: string;

    @Column({type: 'varchar', length: 30})
    lastname: string;

    @Column({type: 'varchar', length: 100, unique: true})
    email: string;

    @Column({type: 'varchar', length: 50})
    password: string;
}