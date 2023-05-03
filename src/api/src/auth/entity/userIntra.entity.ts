import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserIntra {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 30, unique: true})
    login: string;

    @Column({type: 'varchar', length: 50})
    displayname: string;

    @Column({type: 'varchar', length: 30})
    firstname: string;

    @Column({type: 'varchar', length: 30})
    lastname: string;

    @Column({type: 'varchar', length: 100, unique: true})
    email: string;
}