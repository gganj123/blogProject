import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../apis';

type UserParameters = {
  _id: string;
  nickname: string;
  email: string;
};

export const useGetUserListApi = () => {
  return useQuery<UserParameters[]>({
    queryKey: ['users'],
    queryFn: repositories.usersApi.getUserList,
    enabled: true,
  });
};

export const useDeleteUserByIdApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetId: string) =>
      repositories.usersApi.deleteUser(targetId), // mutation 사용법 검토받기!
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] }); // 사용자 목록 데이터 초기화? 새로고침?
    },
  });
};
