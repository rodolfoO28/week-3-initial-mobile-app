import React from 'react';
import { Alert } from 'react-native';

import { render, fireEvent, waitFor } from 'react-native-testing-library';

import { Platform } from 'react-native';
import SignIn from '../../pages/SignIn';

const mockedNavigate = jest.fn();
const mockedSignIn = jest.fn();

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
      signIn: mockedSignIn,
    }),
  };
});

describe('Sign In Page', () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
    mockedSignIn.mockClear();
  });

  it('should contains email/password inputs', () => {
    const { getByPlaceholder } = render(<SignIn />);

    expect(getByPlaceholder('E-mail')).toBeTruthy();
    expect(getByPlaceholder('Senha')).toBeTruthy();
  });

  it('should be able to sign in', async () => {
    const { getByPlaceholder, getByText } = render(<SignIn />);

    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Entrar');

    fireEvent.changeText(emailField, 'johndoe@example.com');
    fireEvent.changeText(passwordField, '123456');
    fireEvent(buttonElement, 'onPress');

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledWith({
        email: 'johndoe@example.com',
        password: '123456',
      });
    });
  });

  it('should be able to sign in using next/submit keyboard', async () => {
    const { getByPlaceholder } = render(<SignIn />);

    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');

    fireEvent.changeText(emailField, 'johndoe@example.com');

    await waitFor(() => {
      fireEvent(emailField, 'onSubmitEditing');
    });

    fireEvent.changeText(passwordField, '123456');
    await waitFor(() => {
      fireEvent(passwordField, 'onSubmitEditing');
    });

    expect(mockedSignIn).toHaveBeenCalledWith({
      email: 'johndoe@example.com',
      password: '123456',
    });
  });

  it('should not be able to sign in with invalid credentials', async () => {
    const { getByPlaceholder, getByText } = render(<SignIn />);

    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Entrar');

    fireEvent.changeText(emailField, 'not-valid-email');
    fireEvent.changeText(passwordField, '123456');
    fireEvent(buttonElement, 'onPress');

    await waitFor(() => {
      expect(mockedSignIn).not.toHaveBeenCalled();
    });
  });

  it('should display an error with login fails', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');

    mockedSignIn.mockImplementation(() => {
      throw new Error();
    });

    const { getByPlaceholder, getByText } = render(<SignIn />);

    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Entrar');

    fireEvent.changeText(emailField, 'johndoe@example.com');
    fireEvent.changeText(passwordField, '123456');
    fireEvent(buttonElement, 'onPress');

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledWith({
        email: 'johndoe@example.com',
        password: '123456',
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  it('should be able navigate to Sing Up', async () => {
    const { getByTestId } = render(<SignIn />);

    const signUpButton = getByTestId('sign-up-button');

    fireEvent(signUpButton, 'onPress');

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('SignUp');
    });
  });

  it('should keyboard view is padding with IOs e undefined with android', async () => {
    Platform.OS = 'ios';

    const { getByTestId, rerender } = render(<SignIn />);

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
    rerender(<SignIn />);

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
