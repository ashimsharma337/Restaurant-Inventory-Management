import { gql } from 'graphql-tag';

export const typeDefs = gql`
  """
  Product stored in inventory
  """
  type Product {
    id: ID!
    name: String!
    category: String!
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
    category: String!
    quantity: Int!
    unit: String!
    price: Float!
  }

  """
  Input used when updating a product
  """
  input UpdateProductInput {
    name: String
    category: String
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
`;


