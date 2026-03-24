import { useQuery } from '@apollo/client/react';
import { GET_PRODUCTS } from '@/graphql/client/queries';

const useInventory = () => {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS);

  return {
    products: data?.products || [],
    loading,
    error,
    refetch,
  };
};

export default useInventory;