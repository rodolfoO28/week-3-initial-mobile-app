import React from 'react';
import { Alert, Platform } from 'react-native';
import { render, fireEvent, waitFor } from 'react-native-testing-library';

import MockAdapter from 'axios-mock-adapter';

import api from '../../services/api';

import SignUp from '../../pages/SignUp';

const alertSpy = jest.spyOn(Alert, 'alert');

const mockedNavigate = jest.fn();
const mockedGoBack = jest.fn();

const apiMock = new MockAdapter(api);

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: mockedNavigate,
      goBack: mockedGoBack,
    }),
  };
});

describe('Sign Up Page', () => {
  beforeEach(() => {
    alertSpy.mockReset();

    apiMock.onPost('users').reply(200, {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    mockedNavigate.mockClear();
    mockedGoBack.mockClear();
  });

  it('should contains name/email/password inputs', () => {
    const { getByPlaceholder } = render(<SignUp />);

    expect(getByPlaceholder('Nome')).toBeTruthy();
    expect(getByPlaceholder('E-mail')).toBeTruthy();
    expect(getByPlaceholder('Senha')).toBeTruthy();
  });

  it('should be able to sign up', async () => {
    const { getByPlaceholder, getByText } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Cadastrar');

    fireEvent.changeText(nameField, 'John Doe');
    fireEvent.changeText(emailField, 'johndoe@example.com');
    fireEvent.changeText(passwordField, '123456');

    fireEvent(buttonElement, 'onPress');

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
      expect(mockedGoBack).toHaveBeenCalled();
    });
  });

  it('should be able to sign up using next/submit keyboard', async () => {
    const { getByPlaceholder } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');

    fireEvent.changeText(nameField, 'John Doe');
    await waitFor(() => {
      fireEvent(nameField, 'onSubmitEditing');
    });

    fireEvent.changeText(emailField, 'johndoe@example.com');
    await waitFor(() => {
      fireEvent(emailField, 'onSubmitEditing');
    });

    fireEvent.changeText(passwordField, '123456');
    await waitFor(() => {
      fireEvent(passwordField, 'onSubmitEditing');
    });

    expect(alertSpy).toHaveBeenCalled();
    expect(mockedGoBack).toHaveBeenCalled();
  });

  it('should not be able to sign up with invalid credentials', async () => {
    const { getByPlaceholder, getByText } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Cadastrar');

    fireEvent.changeText(nameField, '');
    fireEvent.changeText(emailField, 'not-valid-email');
    fireEvent.changeText(passwordField, '');

    fireEvent(buttonElement, 'onPress');

    await waitFor(() => {
      expect(mockedGoBack).not.toHaveBeenCalled();
    });
  });

  it('should display an error with sign up fails', async () => {
    apiMock.onPost('users').reply(500, {});

    const { getByPlaceholder, getByText } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Cadastrar');

    fireEvent.changeText(nameField, 'John Doe');
    fireEvent.changeText(emailField, 'johndoe@example.com');
    fireEvent.changeText(passwordField, '123456');

    fireEvent(buttonElement, 'onPress');

    await waitFor(() => {
      expect(mockedGoBack).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  it('should be able navigate to back logon', async () => {
    const { getByTestId } = render(<SignUp />);

    const goBackButton = getByTestId('go-back-button');

    fireEvent(goBackButton, 'onPress');

    await waitFor(() => {
      expect(mockedGoBack).toHaveBeenCalled();
    });
  });

  it('should keyboard view is padding with IOs e undefined with android', async () => {
    Platform.OS = 'ios';

    const { getByTestId, rerender } = render(<SignUp />);

    const keyboardView = getByTestId('keyborad-view');

    await waitFor(() => {
      expect(keyboardView.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            paddingBottom: 0,
          }),
        ]),
      );
    });

    Platform.OS = 'android';
    rerender(<SignUp />);

    await waitFor(() => {
      expect(keyboardView.props.style).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            paddingBottom: 0,
          }),
        ]),
      );
    });
  });
});
