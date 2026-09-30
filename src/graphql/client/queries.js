import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      category {
        id
        name
      }
      quantity
      unit
      price
      status
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      category {
        id
        name
      }
      quantity
      unit
      price
      status
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      quantity
      price
      status
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

export const GET_USAGE_REPORT = gql`
  query GetUsageReport($startDate: String!, $endDate: String!) {
    usageReport(startDate: $startDate, endDate: $endDate) {
      productId
      name
      category
      quantityUsed
      unit
    }
  }
`;

export const RECORD_USAGE = gql`
  mutation RecordUsage($input: RecordUsageInput!) {
    recordUsage(input: $input) {
      id
      productId
      quantityUsed
      usedAt
    }
  }
`;
