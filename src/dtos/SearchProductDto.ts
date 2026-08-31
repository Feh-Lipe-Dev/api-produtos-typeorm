import { Transform, Type } from "class-transformer";
import { IsOptional, IsNumber, IsString, IsIn } from "class-validator";

export class SearchProductDto {
    @IsOptional()
    @IsString()
    nome?: string;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    categoryId?: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    minPrice?: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    maxPrice?: number;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    sort?: "name" | "price" | "stock";

    @Transform(({ value }) => value.toUpperCase())
    @IsOptional()
    @IsString()
    @IsIn(["ASC", "DESC"])
    order?: "ASC" | "DESC";

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    page?: number;

    @Type(() => Number)
    @IsNumber()
    limit = 10;
}