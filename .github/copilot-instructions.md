# Armazém do Seu João — Contexto da API

## Configuração

- **URL Base**: `http://localhost:3000`
- **Stack do Front-end**: HTML puro, Tailwind CSS via CDN Play, JavaScript puro (Fetch API)
- **Restrição**: nunca usar React, Vue, Angular ou qualquer outro framework JS

## Entidades

- **Product**: `id` (number), `name` (string), `description` (string | null), `price` (number), `created_at` (string)
- **Customer**: `id` (number), `name` (string), `email` (string, único), `phone` (string | null), `created_at` (string)
- **Order**: `id` (number), `customer_id` (number), `total` (number), `created_at` (string)
- **OrderItem**: `id` (number), `order_id` (number), `product_id` (number), `quantity` (number, inteiro > 0), `unit_price` (number)

## Endpoints

| Método | Rota                  | Corpo da Requisição                                  | Resposta      |
| ------ | --------------------- | ---------------------------------------------------- | ------------- |
| GET    | /products             | —                                                    | Product[]     |
| GET    | /products/:id         | —                                                    | Product       |
| POST   | /products             | `{ name, description?, price }`                      | Product 201   |
| PUT    | /products/:id         | `{ name?, description?, price? }`                    | Product       |
| DELETE | /products/:id         | —                                                    | 204           |
| GET    | /customers            | —                                                    | Customer[]    |
| GET    | /customers/:id        | —                                                    | Customer      |
| POST   | /customers            | `{ name, email, phone? }`                            | Customer 201  |
| PUT    | /customers/:id        | `{ name?, email?, phone? }`                          | Customer      |
| DELETE | /customers/:id        | —                                                    | 204           |
| GET    | /customers/:id/orders | —                                                    | Order[]       |
| GET    | /orders               | —                                                    | Order[]       |
| GET    | /orders/:id           | —                                                    | Order + itens |
| POST   | /orders               | `{ customer_id, items: [{ product_id, quantity }] }` | Order 201     |

## Regras de Negócio

- E-mail de cliente é único — duplicata retorna 409
- Preço do produto deve ser maior que zero
- Um pedido deve ter pelo menos um item
- A quantidade de cada item deve ser um inteiro maior que zero
- O `unit_price` no OrderItem é o preço do produto no momento da venda e não muda retroativamente
- Não é possível remover cliente que tenha pedidos registrados (retorna 409)
- Não é possível remover produto que esteja em algum pedido (retorna 409)
