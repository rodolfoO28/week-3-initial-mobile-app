import React from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { render, fireEvent, waitFor } from 'react-native-testing-library';

import AppointmentCreated from '../../pages/AppointmentCreated';

const mockedReset = jest.fn();
const mockedParams = jest.fn();

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      reset: mockedReset,
    }),
    useRoute: () => ({
      params: mockedParams(),
    }),
  };
});

describe('Appointment Created Page', () => {
  beforeEach(() => {
    mockedReset.mockClear();
    mockedParams.mockClear();
  });

  it('should be show appointment created', () => {
    const dataParams = {
      date: new Date(),
      provider: 'John Doe',
    };

    mockedParams.mockReturnValue(dataParams);

    const formattedDescription = format(
      dataParams.date,
      `EEEE', dia' dd 'de' MMMM 'de' yyyy 'às' HH:00'h com ${dataParams.provider}'`,
      { locale: ptBR },
    );

    const { getByText } = render(<AppointmentCreated />);

    expect(getByText('Agendamento concluído')).toBeTruthy();
    expect(getByText(formattedDescription)).toBeTruthy();
  });

  it('should be back to dashboard when press OK butotn', async () => {
    const { getByTestId } = render(<AppointmentCreated />);

    const okButton = getByTestId('ok-button');

    fireEvent(okButton, 'onPress');

    await waitFor(() => {
      expect(mockedReset).toBeCalled();
    });
  });
});
