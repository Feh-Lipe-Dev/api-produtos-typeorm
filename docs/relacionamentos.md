# Relacionamento entre Tabelas com TypeORM

Este projeto implementa um relacionamento **N:1 (muitos-para-um)** entre as tabelas `products` e `categories`, ou seja, visto de forma espelhada, um **1:N (um-para-muitos)**: uma categoria pode ter vários produtos, mas cada produto pertence a apenas **uma** categoria.

## Visão geral das tabelas

| Tabela       | Papel no relacionamento                                       |
| ------------ | --------------------------------------------------------------|
| `categories` | Lado "um" — cada linha pode ser referenciada por N produtos   |
| `products`   | Lado "muitos" — possui a **chave estrangeira** (`categoryId`) |

```
┌──────────────┐           ┌──────────────────┐
│  categories  │           │     products     │
├──────────────┤           ├──────────────────┤
│ id        PK │◄─────┐    │ id            PK │
│ nome         │      └────│ categoryId  FK   │
│ descricao    │           │ nome             │
│ criadoEm     │           │ preco            │
│ atualizadoEm │           │ estoque          │
└──────────────┘           └──────────────────┘
```

A coluna `categoryId` na tabela `products` é a **chave estrangeira** que aponta para `categories.id`. É assim que o PostgreSQL materializa fisicamente o relacionamento.

---

## 1. Lado proprietário da relação — `Product.ts`

```ts
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToOne
} from "typeorm";
import { Category } from "./Category";

@Entity('products')
export class Product {
    // ...outras colunas...

    @ManyToOne(
        () => Category, category => category.products
    )
    category!: Category;
}
```

### Por que `@ManyToOne`?

O decorador `@ManyToOne` declara que **vários produtos podem estar ligados a uma mesma categoria**. Ele é aplicado à propriedade `category` dentro de `Product`, porque é o produto que guarda a chave estrangeira.

Esse é o chamado **lado proprietário (owning side)** do relacionamento. Em TypeORM:

> **Somente o lado proprietário cria a coluna de chave estrangeira no banco.**

Como o `@ManyToOne` está em `Product`, é a tabela `products` que recebe a coluna `categoryId`.

### Anatomia dos parâmetros: ManyToOne

```ts
@ManyToOne(
    () => Category,               //indica qual entidade está do outro lado do relacionamento
    category => category.products //indica qual property de Product representa o outro lado do relacionamento
)
category!: Category;
```

**1º parâmetro — `() => Category`**
Uma *arrow function* que retorna a classe da entidade relacionada. Esse padrão de "função que retorna o tipo" (em vez de passar `Category` diretamente) existe por dois motivos:

- **Evita dependência circular:** `Category` importa `Product` e `Product` importa `Category`. Se as classes fossem referenciadas diretamente nos decoradores, o carregamento dos módulos poderia acontecer antes de ambas estarem definidas. A arrow function adia a leitura da classe para quando o TypeORM realmente precisa dela.
- **Carregamento tardio (lazy):** permite ao TypeORM resolver metadados das entidades somente durante a inicialização do `DataSource`.

**2º parâmetro — `(category) => category.products`**
Função que indica **qual propriedade na entidade oposta representa o mesmo relacionamento**. Aqui dizemos: "o lado inverso desta relação é a propriedade `products` dentro de `Category`". O TypeORM usa isso para montar o grafo de metadados e permitir consultas com `relations`. Esse parâmetro é opcional, mas sem ele o lado inverso não funcionaria corretamente.

**Propriedade — `category!: Category`**
Receberá um **objeto completo** da entidade `Category` quando o relacionamento for carregado (via `relations`, eager ou lazy). Sem carregar, o valor fica `undefined` — a FK continua existindo no banco, mas o objeto não vem populado. O `!` (definite assignment assertion) informa ao TypeScript que a propriedade será preenchida fora do construtor.

---

## 2. Lado inverso da relação — `Category.ts`

```ts
@OneToMany(
    () => Product, product => product.category
)
@JoinColumn({ name: 'categoryId' })
products!: Product[];
```

### Por que `@OneToMany`?

O `@OneToMany` declara que **uma categoria possui muitos produtos**. Ele é sempre o **lado inverso (inverse side)** e segue duas regras importantes:

1. **Não existe sozinho:** todo `@OneToMany` exige obrigatoriamente um `@ManyToOne` correspondente no outro lado da relação (aqui, `Product.category`). Se um lado não existir, o TypeORM lança erro na inicialização.
2. **Não cria coluna nenhuma:** como quem "possui" a FK é `Product`, este lado serve apenas para navegar na relação em memória e nas queries.

### Anatomia dos parâmetros: OneToMany

```ts
@OneToMany(
    () => Product,                 // 1º parâmetro: entidade relacionada
    product => product.category    // 2º parâmetro: lado proprietário
)
products!: Product[];
```

**1º parâmetro — `() => Product`**: mesma lógica da arrow function explicada acima.

**2º parâmetro — `(product) => product.category`**: aponta de volta para o lado proprietário. Lê-se: "cada elemento desta lista tem uma propriedade `category` que aponta de volta para esta categoria".

**Propriedade — `products!: Product[]`**
É um **array**, pois uma categoria agrega múltiplos produtos. Ao carregar uma categoria com `relations`, essa propriedade vira uma lista de objetos `Product`.

---

## 3. O papel do `@JoinColumn`

```ts
@JoinColumn({ name: 'categoryId' })
```

O decorador `@JoinColumn` controla **qual coluna física armazena a chave estrangeira** — neste caso, nomeando-a como `categoryId`.

**Observação técnica importante sobre este projeto:** o `@JoinColumn` foi posicionado no lado `@OneToMany` (`Category`), onde conceitualmente ele **não pertence**. A própria documentação do TypeORM restringe seu uso aos lados `@OneToOne` e `@ManyToOne` (existe até a classe interna `UsingJoinColumnIsNotAllowedError` para isso). Na prática, nesta versão o decorador é simplesmente **ignorado** nesse lado inverso — o projeto funciona porque:

1. Quem define a FK é o `@ManyToOne` em `Product`;
2. O **nome padrão** que o TypeORM geraria para a coluna já seria `categoryId` de qualquer forma (convenção: nome da propriedade + `Id`, ou seja, `category` → `categoryId`).

Ou seja: o resultado final está correto, mas o `@JoinColumn` ali é redundante. As duas formas equivalentes e recomendadas seriam:

```ts
// Opção A — omitir totalmente (o padrão já gera "categoryId")
@ManyToOne(() => Category, category => category.products)
category!: Category;

// Opção B — declarar explicitamente no lado proprietário (donos da FK)
@ManyToOne(() => Category, category => category.products)
@JoinColumn({ name: 'categoryId' })   // agora sim, no lugar correto
category!: Category;
```

---

## 4. SQL gerado pelo TypeORM

Com `synchronize: true` (configurado em `src/database/data-source.ts`), o TypeORM traduz os decoradores nestes comandos DDL equivalentes:

```sql
CREATE TABLE categories (
    id             SERIAL PRIMARY KEY,
    nome           VARCHAR(100) NOT NULL UNIQUE,
    descricao      TEXT NOT NULL,
    criadoEm       TIMESTAMP NOT NULL DEFAULT now(),
    atualizadoEm   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id             SERIAL PRIMARY KEY,
    nome           VARCHAR(150) NOT NULL UNIQUE,
    descricao      VARCHAR(255) NOT NULL,
    preco          DECIMAL(10,2) NOT NULL,
    estoque        INTEGER NOT NULL DEFAULT 0,
    "categoryId"   INTEGER,                -- criada pelo @ManyToOne
    criadoEm       TIMESTAMP NOT NULL DEFAULT now(),
    atualizadoEm   TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "FK_products_category"          -- constraint de integridade
        FOREIGN KEY ("categoryId")
        REFERENCES categories(id)
);
```

Pontos-chave do que o `@ManyToOne` gera automaticamente:

- Coluna `"categoryId" INTEGER` em `products` (nome derivado da propriedade `category`);
- Constraint `FOREIGN KEY` garantindo integridade referencial: não é possível salvar um produto com `categoryId` inexistente em `categories`, nem apagar uma categoria que ainda tenha produtos (comportamento padrão `NO ACTION`);
- A coluna nasce **nullable** por padrão (um produto pode existir sem categoria, a menos que se use `{ nullable: false }` ou `{ onDelete: ... }` nas opções do decorador).

---

## 5. Como o relacionamento se comporta nas consultas

### Consulta SEM carregar a relação

```ts
const products = await productRepository.find();
// products[0].category === undefined
```

O TypeORM retorna só as colunas de `products`. A relação **nunca é carregada implicitamente** — isso evita queries desnecessárias e problemas de performance (o clássico problema N+1).

### Consulta COM a relação carregada (eager loading explícito)

```ts
const products = await productRepository.find({
    relations: { category: true }   // gera LEFT JOIN com categories
});
// products[0].category === { id: 3, nome: "Eletrônicos", ... }
```

SQL aproximado gerado:

```sql
SELECT products.*, categories.*
FROM products
LEFT JOIN categories ON categories.id = products."categoryId"
```

### Via QueryBuilder

```ts
const products = await productRepository
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.category', 'category') // 'product.category' usa o metadado do @ManyToOne
    .getMany();
```

A string `'product.category'` referencia a propriedade decorada — é exatamente aqui que o 2º parâmetro dos decoradores (`category => category.products`) importa: ele conecta os dois lados nos metadados, permitindo navegar a relação em qualquer direção.

### Carregando no sentido inverso (categoria → produtos)

```ts
const categoryRepo = AppDataSource.getRepository(Category);

const category = await categoryRepo.findOne({
    where: { id: 1 },
    relations: { products: true }   // usa o metadado do @OneToMany
});
// category.products === [ {...}, {...} ]
```

### Eager vs Lazy (opções do decorador)

```ts
// EAGER: categoria sempre carregada em qualquer find() de produto
@ManyToOne(() => Category, category => category.products, { eager: true })

// LAZY: category só é buscada ao acessar product.category (requer Promise<Category>)
@ManyToOne(() => Category, category => category.products, { lazy: true })
category!: Promise<Category>;
```

---

## 6. Salvando registros relacionados

Como o lado proprietário é `Product.category`, basta informar a categoria (mesmo que só com o `id`) ao salvar o produto:

```ts
await productRepository.save({
    nome: 'Teclado Mecânico',
    descricao: 'Teclado RGB switch blue',
    preco: 250.00,
    estoque: 10,
    category: { id: 2 }   // associa à categoria de id 2 (FK preenchida)
});
```

O TypeORM reconhece `category: { id: 2 }` e grava `"categoryId" = 2` na tabela `products` — sem precisar carregar o objeto `Category` inteiro.

---

## Resumo

| Elemento | Entidade | Papel |
| -------- | -------- | ----- |
| `@ManyToOne(() => Category, category => category.products)` | `Product` | **Lado proprietário**: cria a FK `categoryId` e a constraint no banco |
| `@OneToMany(() => Product, product => product.category)` | `Category` | **Lado inverso**: expõe `products: Product[]`, não cria coluna |
| `@JoinColumn({ name: 'categoryId' })` | `Category` (posicionado no lado errado) | Nomearia a FK, mas é ignorado em `@OneToMany`; redundante, pois `categoryId` já é o nome padrão |
| Propriedade `category!: Category` | `Product` | Objeto único — reflete o "muitos-para-um" |
| Propriedade `products!: Product[]` | `Category` | Array — reflete o "um-para-muitos" |
