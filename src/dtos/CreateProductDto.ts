import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    nome!: string;

    @IsString()
    @IsNotEmpty()
    descricao!: string;

    @IsNumber()
    @IsPositive()
    preco!: number;

    @IsInt()
    @Min(0)
    estoque!: number;

    @IsInt()
    @IsPositive()
    categoryId!: number
}