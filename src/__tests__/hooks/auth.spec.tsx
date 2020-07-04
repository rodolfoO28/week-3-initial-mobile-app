import { renderHook } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';

import AsyncStorage from '@react-native-community/async-storage';
import { useAuth, AuthProvider } from '../../hooks/auth';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

describe('Auth hook', () => {
  it('should be able to sign in', async () => {
    const apiResponse = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'johndoe@example.com.br',
      },
      token: 'token-123',
    };

    apiMock.onPost('sessions').reply(200, apiResponse);

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: 'johndoe@example.com.br',
      password: '123456',
    });

    await waitForNextUpdate();

    expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
      ['@GoBarber:token', apiResponse.token],
      ['@GoBarber:user', JSON.stringify(apiResponse.user)],
    ]);

    expect(result.current.user.email).toEqual('johndoe@example.com.br');
  });

  it('should restore saved data from storage when auth inits', async () => {
    jest.spyOn(AsyncStorage, 'multiGet').mockImplementation(async () => {
      return [
        ['@GoBarber:token', 'token-123'],
        [
          '@GoBarber:user',
          JSON.stringify({
            id: 'user-123',
            name: 'John Doe',
            email: 'johndoe@example.com.br',
          }),
        ],
      ];
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitForNextUpdate();

    expect(result.current.user.email).toEqual('johndoe@example.com.br');
  });

  it('should be able to sign out', async () => {
    jest.spyOn(AsyncStorage, 'multiGet').mockImplementation(async () => {
      return [
        ['@GoBarber:token', 'token-123'],
        [
          '@GoBarber:user',
          JSON.stringify({
            id: 'user-123',
            name: 'John Doe',
            email: 'johndoe@example.com.br',
          }),
        ],
      ];
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signOut();

    await waitForNextUpdate();

    expect(result.current.user).toBeUndefined();
  });

  it('should be able to update user data', async () => {
    const user = {
      id: 'user-123',
      name: 'John Doe',
      email: 'johndoe@example.com.br',
      avatar_url: 'image.png',
    };

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.updateUser(user);

    await waitForNextUpdate();

    expect(result.current.user).toEqual(user);
  });
});
