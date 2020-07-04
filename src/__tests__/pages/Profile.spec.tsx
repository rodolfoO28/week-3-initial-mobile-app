import React from 'react';
import { Alert, Platform } from 'react-native';
import { render, fireEvent, waitFor } from 'react-native-testing-library';

import ImagePicker from 'react-native-image-picker';
import ImageEditor from '@react-native-community/image-editor';

import MockAdapter from 'axios-mock-adapter';

import api from '../../services/api';

import Profile from '../../pages/Profile';

const alertSpy = jest.spyOn(Alert, 'alert');

const mockedNavigate = jest.fn();
const mockedGoBack = jest.fn();
const mockedUpdateUser = jest.fn();

const apiMock = new MockAdapter(api);

const response = {
  customButton: '',
  didCancel: false,
  error: '',
  fileName: 'pixel.jpg',
  data:
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNUuz73PwAFYAKbSSNX6QAAAABJRU5ErkJggg==',
  uri: 'file://pixel.jpg',
  isVertical: false,
  width: 1,
  height: 1,
  fileSize: 70,
  type: 'image/jpeg',
};

ImagePicker.showImagePicker = jest
  .fn()
  .mockImplementation((_, callback) => callback(response));

ImageEditor.cropImage = jest.fn().mockImplementation(async () => response.uri);

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: mockedNavigate,
      goBack: mockedGoBack,
    }),
  };
});

jest.mock('../../hooks/auth', () => {
  return {
    useAuth: () => ({
      user: jest.fn().mockReturnValue({}),
      updateUser: mockedUpdateUser,
    }),
  };
});

describe('Profile Page', () => {
  beforeEach(() => {
    response.error = '';
    response.didCancel = false;

    alertSpy.mockReset();

    apiMock.onPut('profile').reply(200, {});
    apiMock.onPatch('users/avatar').reply(200, {});

    mockedNavigate.mockClear();
    mockedGoBack.mockClear();
    mockedUpdateUser.mockClear();
  });

  it('should be able to update profile', async () => {
    const { getByPlaceholder, getByText } = render(<Profile />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');

    const oldPasswordField = getByPlaceholder('Senha atual');
    const passwordField = getByPlaceholder('Nova senha');
    const confirmationPasswordField = getByPlaceholder('Confirmar senha');

    const buttonElement = getByText('Confirmar mudanças');

    fireEvent.changeText(nameField, 'John Doe');
    fireEvent.changeText(emailField, 'johndoe@example.com');

    fireEvent.changeText(oldPasswordField, '');
    fireEvent.changeText(passwordField, '');
    fireEvent.changeText(confirmationPasswordField, '');

    fireEvent(buttonElement, 'onPress');

    await waitFor(() => {
      expect(mockedUpdateUser).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
      expect(mockedGoBack).toHaveBeenCalled();
    });
  });

  it('should be able to update password profile', async () => {
    const { getByPlaceholder, getByText } = render(<Profile />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');

    const oldPasswordField = getByPlaceholder('Senha atual');
    const passwordField = getByPlaceholder('Nova senha');
    const confirmationPasswordField = getByPlaceholder('Confirmar senha');

    const buttonElement = getByText('Confirmar mudanças');

    fireEvent.changeText(nameField, 'John Doe');
    fireEvent.changeText(emailField, 'johndoe@example.com');

    fireEvent.changeText(oldPasswordField, '123456');
    fireEvent.changeText(passwordField, '1234567');
    fireEvent.changeText(confirmationPasswordField, '1234567');

    fireEvent(buttonElement, 'onPress');

    await waitFor(() => {
      expect(mockedUpdateUser).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
      expect(mockedGoBack).toHaveBeenCalled();
    });
  });

  it('should be able to update profile using next/submit keyboard', async () => {
    const { getByPlaceholder } = render(<Profile />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');

    const oldPasswordField = getByPlaceholder('Senha atual');
    const passwordField = getByPlaceholder('Nova senha');
    const confirmationPasswordField = getByPlaceholder('Confirmar senha');

    fireEvent.changeText(nameField, 'John Doe');
    await waitFor(() => {
      fireEvent(nameField, 'onSubmitEditing');
    });

    fireEvent.changeText(emailField, 'johndoe@example.com');
    await waitFor(() => {
      fireEvent(emailField, 'onSubmitEditing');
    });

    fireEvent.changeText(oldPasswordField, '');
    await waitFor(() => {
      fireEvent(oldPasswordField, 'onSubmitEditing');
    });

    fireEvent.changeText(passwordField, '');
    await waitFor(() => {
      fireEvent(passwordField, 'onSubmitEditing');
    });

    fireEvent.changeText(confirmationPasswordField, '');
    await waitFor(() => {
      fireEvent(confirmationPasswordField, 'onSubmitEditing');
    });

    expect(mockedUpdateUser).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
    expect(mockedGoBack).toHaveBeenCalled();
  });

  it('should not be able to update profile with invalid credentials', async () => {
    const { getByPlaceholder, getByText } = render(<Profile />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');

    const oldPasswordField = getByPlaceholder('Senha atual');
    const passwordField = getByPlaceholder('Nova senha');
    const confirmationPasswordField = getByPlaceholder('Confirmar senha');

    const buttonElement = getByText('Confirmar mudanças');

    fireEvent.changeText(nameField, '');
    fireEvent.changeText(emailField, 'invalid-email');

    fireEvent.changeText(oldPasswordField, '');
    fireEvent.changeText(passwordField, '123456');
    fireEvent.changeText(confirmationPasswordField, '1324567');

    fireEvent(buttonElement, 'onPress');

    await waitFor(() => {
      expect(mockedUpdateUser).not.toHaveBeenCalled();
      expect(mockedGoBack).not.toHaveBeenCalled();
    });
  });

  it('should display an error with update profile fails', async () => {
    apiMock.onPut('profile').reply(500, {});

    const { getByPlaceholder, getByText } = render(<Profile />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');

    const oldPasswordField = getByPlaceholder('Senha atual');
    const passwordField = getByPlaceholder('Nova senha');
    const confirmationPasswordField = getByPlaceholder('Confirmar senha');

    const buttonElement = getByText('Confirmar mudanças');

    fireEvent.changeText(nameField, 'John Doe');
    fireEvent.changeText(emailField, 'johndoe@example.com');

    fireEvent.changeText(oldPasswordField, '');
    fireEvent.changeText(passwordField, '');
    fireEvent.changeText(confirmationPasswordField, '');

    fireEvent(buttonElement, 'onPress');

    await waitFor(() => {
      expect(mockedUpdateUser).not.toHaveBeenCalled();
      expect(mockedGoBack).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  it('should be able update avatar profile', async () => {
    const { getByTestId } = render(<Profile />);

    const avatarButton = getByTestId('avatar-button');

    fireEvent(avatarButton, 'onPress');

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Avatar atualizado com sucesso!');
    });
  });

  it('should not be able update avatar profile fails', async () => {
    apiMock.onPatch('users/avatar').reply(500, {});
    const { getByTestId } = render(<Profile />);

    const avatarButton = getByTestId('avatar-button');

    fireEvent(avatarButton, 'onPress');

    await waitFor(() => {
      expect(mockedUpdateUser).not.toHaveBeenCalled();
      expect(alertSpy).not.toHaveBeenCalledWith(
        'Avatar atualizado com sucesso!',
      );
    });
  });

  it('should not be able to avatar profile when close image picker', async () => {
    response.didCancel = true;

    const { getByTestId } = render(<Profile />);

    const avatarButton = getByTestId('avatar-button');

    fireEvent(avatarButton, 'onPress');

    await waitFor(() => {
      expect(mockedUpdateUser).not.toHaveBeenCalled();
      expect(alertSpy).not.toHaveBeenCalled();
    });
  });

  it('should not be able to avatar profile when image picker fail', async () => {
    response.error = 'ERROR NA IMAGE';

    const { getByTestId } = render(<Profile />);

    const avatarButton = getByTestId('avatar-button');

    fireEvent(avatarButton, 'onPress');

    await waitFor(() => {
      expect(mockedUpdateUser).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Erro ao atualizar seu avatar.');
    });
  });

  it('should be able navigate to back', async () => {
    const { getByTestId } = render(<Profile />);

    const goBackButton = getByTestId('go-back-button');

    fireEvent(goBackButton, 'onPress');

    await waitFor(() => {
      expect(mockedGoBack).toHaveBeenCalled();
    });
  });

  it('should keyboard view is padding with IOs e undefined with android', async () => {
    Platform.OS = 'ios';

    const { getByTestId, rerender } = render(<Profile />);

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
    rerender(<Profile />);

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
