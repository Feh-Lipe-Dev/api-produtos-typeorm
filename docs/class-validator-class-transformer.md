# class-validator e class-transformer

## class-transformer

Responsável por **converter (transformar)** dados brutos (ex.: o `req.body` de uma requisição HTTP) em instâncias de classes TypeScript/JavaScript, aplicando transformações de tipo no processo.

### Como funciona na prática

```ts
// Sem transformação: req.body é um objeto simples (plain object)
const dados = { nome: "Notebook", preco: "1999.00" };
// dados.preco é uma string!

// Com class-transformer: converte o objeto bruto em instância da classe Product
import { plainToInstance } from "class-transformer";
const product = plainToInstance(Product, dados);
// product.preco agora é number (gracas ao @Transform no decorator da entidade)
```

### Decorators comuns

| Decorator              | Função                                                             |
| ---------------------- | ------------------------------------------------------------------ |
| `@Type(() => Number)`  | Força a conversão do valor para o tipo indicado                    |
| `@Transform`           | Permite aplicar uma função customizada de transformação            |
| `@Expose` / `@Exclude` | Controla quais propriedades são expostas/ocultas na serialização   |

---

## class-validator

Responsável por **validar** se uma instância de classe obedece a regras de negócio definidas por decorators. Trabalha lado a lado com `class-transformer`: primeiro você transforma, depois valida.

### validator na prática

```ts
import { IsString, IsNumber, IsNotEmpty, Min } from "class-validator";
import { validate } from "class-validator";

class Product {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsNumber()
  @Min(0.01)
  preco!: number;
}

const product = plainToInstance(Product, { nome: "", preco: -5 });
const erros = await validate(product);

if (erros.length > 0) {
  console.log(erros);
  // [
  //   { property: "nome", constraints: { isNotEmpty: "nome should not be empty" } },
  //   { property: "preco", constraints: { min: "preco must not be less than 0.01" } }
  // ]
}
```

### Decorators comuns do validator

| Decorator                     | Função                                                  |
| -------------------           | ------------------------------------------------------- |
| `@IsString()`                 | Garante que o valor é uma string                        |
| `@IsNumber()`                 | Garante que o valor é numérico                          |
| `@IsNotEmpty()`               | Rejeita strings vazias ou `null`                        |
| `@Min(valor)` / `@Max(valor)` | Define limites numéricos                                |
| `@IsEmail()`                  | Valida formato de e-mail                                |
| `@IsOptional()`               | Torna o campo opcional (remove a validação obrigatória) |
| `@Matches(regex)`             | Valida contra uma expressão regular                     |

---

## Resumo rápido

```cmd
Requisição HTTP
       │
       ▼
class-transformer ──► plainToInstance(Class, body)   ──► instância da classe
       │
       ▼
class-validator   ──► validate(instancia)            ──► lista de erros[]
       │
       ▼
 Controller decide:  erros.length > 0  →  res.status(400)
                     sem erros         →  salva no banco
```

Sem essas duas bibliotecas, toda validação ficaria manual no controller (``if (!req.body.nome) ...``), o que é repetitivo e propenso a erros. Com decorators, as regras ficam **declarativas** na própria classe, no mesmo lugar onde o tipo é definido.
