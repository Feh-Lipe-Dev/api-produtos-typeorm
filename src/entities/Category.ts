import { Product } from "./Product";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    JoinColumn
} from "typeorm";

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', { length: 100, nullable: false, unique: true })
    nome!: string;

    @Column('text', { nullable: false })
    descricao!: string;

    @OneToMany(
        () => Product, product => product.category
    )
    @JoinColumn({ name: 'categoryId' })
    products!: Product[];

    @CreateDateColumn()
    criadoEm!: Date;

    @UpdateDateColumn()
    atualizadoEm!: Date;

}