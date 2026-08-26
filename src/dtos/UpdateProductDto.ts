import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Min, IsOptional } from "class-validator";

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    nome?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    descricao?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    preco?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    estoque?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    categoryId?: number
}