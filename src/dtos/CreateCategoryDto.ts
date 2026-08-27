import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {

    @IsString({
        message: 'o nome deve ser um texto'
    })
    @IsNotEmpty({
        message: 'o campo não pode conter valores vazios ou espaços em branco'
    })
    nome!: string;

    @IsString({
        message: 'o nome deve ser um texto'
    })
    @IsNotEmpty({
        message: 'o campo não pode conter valores vazios ou espaços em branco'
    })
    descricao!: string;
}