import { gql } from 'graphql-tag';

export const typeDefs = gql`
  """
  Product stored in inventory
  """
  type Product {
    id: ID!
    name: String!
    categoryId: ID!
    category: Category
    quantity: Int!
    unit: String!
    price: Float!
    status: String!
    stockValue: Float!
    createdAt: String
    updatedAt: String
  }

  """
  Input used when creating a product
  """
  input CreateProductInput {
    name: String!
    categoryId: ID!
    quantity: Int!
    unit: String!
    price: Float!
  }

  """
  Input used when updating a product
  """
  input UpdateProductInput {
    name: String
    categoryId: ID
    quantity: Int
    unit: String
    price: Float
    status: String
  }

  type Query {
    products: [Product!]!
    product(id: ID!): Product
  }

  type Mutation {
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    categories: [Category!]!
  }

  extend type Mutation {
    createCategory(name: String!, description: String): Category!
  }
`;


