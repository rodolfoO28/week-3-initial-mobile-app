import React from 'react';
import { Alert, Platform } from 'react-native';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import MockAdapter from 'axios-mock-adapter';
import MockDate from 'mockdate';

import api from '../../services/api';

import CreateAppointment from '../../pages/CreateAppointment';

const alertSpy = jest.spyOn(Alert, 'alert');

const apiMock = new MockAdapter(api);

const mockedNavigate = jest.fn();
const mockedGoBack = jest.fn();

const userLogged = {
  id: 'user-123',
  name: 'John Doe',
  email: 'johndoe@example.com.br',
  avatar_url: 'user-image.png',
};
const mockedUser = jest.fn().mockReturnValue(userLogged);

const providerSelected = {
  id: 'provider-1',
  name: 'John Tree',
  avatar_url: 'john-tree.png',
};
const mockedParams = jest.fn().mockReturnValue({
  providerId: providerSelected.id,
});

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: mockedNavigate,
      goBack: mockedGoBack,
    }),
    useRoute: () => ({
      params: mockedParams(),
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

describe('Create Appointment Page', () => {
  beforeEach(() => {
    MockDate.set(new Date(2020, 6, 2, 5, 0, 0));

    mockedNavigate.mockClear();
    mockedGoBack.mockClear();
    mockedParams.mockClear();

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

    apiMock.onGet('providers/provider-1/day-availability').reply(200, [
      {
        hour: 8,
        available: true,
      },
      {
        hour: 9,
        available: true,
      },
      {
        hour: 10,
        available: true,
      },
      {
        hour: 11,
        available: true,
      },
      {
        hour: 12,
        available: true,
      },
      {
        hour: 13,
        available: true,
      },
      {
        hour: 14,
        available: true,
      },
      {
        hour: 15,
        available: true,
      },
      {
        hour: 16,
        available: true,
      },
      {
        hour: 17,
        available: true,
      },
    ]);

    apiMock.onPost('appointments').reply(200, {
      id: 'schedule-1',
      date: '2020-07-02T12:00:00.000Z',
      user: {
        id: 'user-1',
        name: 'John One',
        avatar_url: 'user-1.png',
      },
    });
  });

  it('should be render create appointment page', async () => {
    const { getByText } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByText('Cabeleireiros')).toBeTruthy();
    });
  });

  it('should be list providers in page with current provider selected', async () => {
    const { getByTestId } = render(<CreateAppointment />);

    const providerListContainer = getByTestId('provider-list');

    await waitFor(() => {
      expect(providerListContainer).toBeTruthy();
    });

    const providerSelectedElement = getByTestId(providerSelected.id);

    expect(providerSelectedElement).toBeTruthy();
    expect(providerSelectedElement.props.selected).toBe(true);
  });

  it('should be change provider by page', async () => {
    const { getByTestId } = render(<CreateAppointment />);

    const providerListContainer = getByTestId('provider-list');

    await waitFor(() => {
      expect(providerListContainer).toBeTruthy();
    });

    const currentProviderElement = getByTestId(providerSelected.id);
    const providerItemElement = getByTestId('provider-2');

    fireEvent(providerItemElement, 'onPress');

    await waitFor(() => {
      expect(currentProviderElement).toBeTruthy();
      expect(currentProviderElement.props.selected).toBe(false);

      expect(providerItemElement).toBeTruthy();
      expect(providerItemElement.props.selected).toBe(true);
    });
  });

  it('should be list hours availability of provider selected', async () => {
    const { getByTestId } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByTestId('schedule-8')).toBeTruthy();
      expect(getByTestId('schedule-9')).toBeTruthy();

      expect(getByTestId('schedule-13')).toBeTruthy();
      expect(getByTestId('schedule-14')).toBeTruthy();
    });
  });

  it('should be able select hour availability of provider selected to create appointment', async () => {
    const { getByTestId } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByTestId('schedule-9')).toBeTruthy();
    });

    let hourSelectedElement = getByTestId('schedule-9');

    fireEvent(hourSelectedElement, 'onPress');

    await waitFor(() => {
      expect(hourSelectedElement).toBeTruthy();
      expect(hourSelectedElement.props.available).toBe(true);
      expect(hourSelectedElement.props.selected).toBe(true);
    });

    hourSelectedElement = getByTestId('schedule-15');

    fireEvent(hourSelectedElement, 'onPress');

    await waitFor(() => {
      expect(hourSelectedElement).toBeTruthy();
      expect(hourSelectedElement.props.available).toBe(true);
      expect(hourSelectedElement.props.selected).toBe(true);
    });
  });

  it('should not be able select hour availability unavailability of provider selected to create appointment', async () => {
    apiMock.onGet('providers/provider-1/day-availability').reply(200, [
      {
        hour: 8,
        available: true,
      },
      {
        hour: 9,
        available: false,
      },
      {
        hour: 10,
        available: false,
      },
      {
        hour: 11,
        available: false,
      },
      {
        hour: 12,
        available: false,
      },
      {
        hour: 13,
        available: false,
      },
      {
        hour: 14,
        available: true,
      },
      {
        hour: 15,
        available: true,
      },
      {
        hour: 16,
        available: true,
      },
      {
        hour: 17,
        available: true,
      },
    ]);

    const { getByTestId } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByTestId('schedule-9')).toBeTruthy();
    });

    let hourSelectedElement = getByTestId('schedule-9');

    expect(hourSelectedElement).toBeTruthy();
    expect(hourSelectedElement.props.available).toBe(false);
    expect(hourSelectedElement.props.selected).toBe(false);

    hourSelectedElement = getByTestId('schedule-13');
    expect(hourSelectedElement).toBeTruthy();
    expect(hourSelectedElement.props.available).toBe(false);
    expect(hourSelectedElement.props.selected).toBe(false);
  });

  it('should be able create appointment', async () => {
    const { getByTestId, getByText } = render(<CreateAppointment />);

    const createAppointmentButton = getByTestId('create-appointment-button');

    fireEvent(createAppointmentButton, 'onPress');

    await waitFor(() => {
      expect(getByText('Agendar')).toBeTruthy();
      expect(mockedNavigate).toHaveBeenCalled();
    });
  });

  it('should not be able create appointment fails', async () => {
    apiMock.onPost('appointments').reply(500, {});

    const { getByTestId, getByText } = render(<CreateAppointment />);

    const createAppointmentButton = getByTestId('create-appointment-button');

    fireEvent(createAppointmentButton, 'onPress');

    await waitFor(() => {
      expect(getByText('Agendar')).toBeTruthy();
      expect(alertSpy).toHaveBeenCalled();
      expect(mockedNavigate).not.toHaveBeenCalledWith('AppointmentCreated');
    });
  });

  it('should be able select another date', async () => {
    const { getByTestId, queryByTestId } = render(<CreateAppointment />);

    const calendarPickerButton = getByTestId('calendar-picker-button');

    await waitFor(() => {
      expect(calendarPickerButton).toBeTruthy();
      expect(queryByTestId('date-picker')).toBeNull();
    });

    fireEvent(calendarPickerButton, 'onPress');

    await waitFor(() => {
      expect(calendarPickerButton).toBeTruthy();
      expect(queryByTestId('date-picker')).not.toBeNull();
    });
  });

  it('should be able handle change another date in calendar IOS', async () => {
    const { getByTestId, queryByTestId } = render(<CreateAppointment />);

    const calendarPickerButton = getByTestId('calendar-picker-button');

    await waitFor(() => {
      expect(calendarPickerButton).toBeTruthy();
      expect(queryByTestId('date-picker')).toBeNull();
    });

    Platform.OS = 'ios';

    fireEvent(calendarPickerButton, 'onPress');

    await waitFor(() => {
      expect(calendarPickerButton).toBeTruthy();
      expect(queryByTestId('date-picker')).not.toBeNull();
    });
  });

  it('should be able handle change another date in calendar Android', async () => {
    const { getByTestId, queryByTestId } = render(<CreateAppointment />);

    const calendarPickerButton = getByTestId('calendar-picker-button');

    await waitFor(() => {
      expect(calendarPickerButton).toBeTruthy();
      expect(queryByTestId('date-picker')).toBeNull();
    });

    Platform.OS = 'android';

    fireEvent(calendarPickerButton, 'onPress');

    await waitFor(() => {
      expect(calendarPickerButton).toBeTruthy();
      expect(queryByTestId('date-picker')).not.toBeNull();
    });
  });

  it('should be able navigate to back', async () => {
    const { getByTestId } = render(<CreateAppointment />);

    const goBackButton = getByTestId('go-back-button');

    fireEvent(goBackButton, 'onPress');

    await waitFor(() => {
      expect(mockedGoBack).toHaveBeenCalled();
    });
  });
});
