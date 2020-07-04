import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import MockAdapter from 'axios-mock-adapter';

import api from '../../services/api';

import Dashboard from '../../pages/Dashboard';

const apiMock = new MockAdapter(api);

const mockedNavigate = jest.fn();
const userLogged = {
  id: 'user-123',
  name: 'John Doe',
  email: 'johndoe@example.com.br',
  avatar_url: 'user-image.png',
};
const mockedUser = jest.fn().mockReturnValue(userLogged);

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: mockedNavigate,
    }),
  };
});

jest.mock('../../hooks/auth', () => {
  return {
    useAuth: () => ({
      user: mockedUser(),
    }),
  };
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    apiMock.onGet('providers').reply(200, [
      {
        id: 'provider-1',
        name: 'John Tree',
        avatar_url: 'john-tree.png',
      },
      {
        id: 'provider-2',
        name: 'John Qua',
        avatar_url: 'john-qua.png',
      },
      {
        id: 'provider-3',
        name: 'John Qui',
        avatar_url: 'john-qui.png',
      },
    ]);
  });

  it('should be render dashboard page', async () => {
    const { getByText } = render(<Dashboard />);

    await waitFor(() => {
      expect(getByText(userLogged.name)).toBeTruthy();
    });
  });

  it('should be list providers in dashboard page', async () => {
    const { getByTestId, getByText } = render(<Dashboard />);

    const profileContainer = getByTestId('provider-container');

    await waitFor(() => {
      expect(getByText(userLogged.name)).toBeTruthy();
      expect(profileContainer).toBeTruthy();
    });
  });

  it('should be empty list providers in dashboard page ', async () => {
    apiMock.onGet('providers').reply(200, []);

    const { getByTestId, getByText, queryByTestId } = render(<Dashboard />);

    const profileContainer = getByTestId('provider-container');

    await waitFor(() => {
      expect(getByText(userLogged.name)).toBeTruthy();
      expect(profileContainer).toBeTruthy();
    });

    expect(queryByTestId('provider-container-provider-1')).toBeNull();
    expect(queryByTestId('provider-container-provider-2')).toBeNull();
    expect(queryByTestId('provider-container-provider-3')).toBeNull();
  });

  it('should be navigate to profile page', async () => {
    const { getByTestId } = render(<Dashboard />);

    const profileButton = getByTestId('profile-button');

    fireEvent(profileButton, 'onPress');

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenLastCalledWith('Profile');
    });
  });

  it('should be navigate to create appointment page', async () => {
    const { getByTestId } = render(<Dashboard />);

    const profileContainer = getByTestId('provider-container');

    await waitFor(() => {
      expect(profileContainer).toBeTruthy();
    });

    const profileContainerProvider1 = getByTestId(
      'provider-container-provider-1',
    );

    fireEvent(profileContainerProvider1, 'onPress');

    await waitFor(() => {
      expect(profileContainerProvider1).toBeTruthy();
      expect(mockedNavigate).toHaveBeenLastCalledWith('CreateAppointment', {
        providerId: 'provider-1',
      });
    });
  });
});
