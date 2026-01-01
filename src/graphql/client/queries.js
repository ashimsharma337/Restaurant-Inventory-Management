import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      category
      quantity
      unit
      price
      status
    }
  }
`;
