import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';

import Input from '../../components/Input';

const mockedUnformFields = jest.fn(() => ({
  fieldName: 'email',
  defaultValue: '',
  error: '',
  registerField: jest.fn(),
}));

jest.mock('@unform/core', () => {
  return {
    useField() {
      return mockedUnformFields();
    },
  };
});

describe('Input component', () => {
  it('should be able to render an input', () => {
    const { getByPlaceholder } = render(
      <Input name="email" icon="mail" placeholder="E-mail" />,
    );

    expect(getByPlaceholder('E-mail')).toBeTruthy();
  });

  it('should render highlight on input focus', async () => {
    const { getByPlaceholder, getByTestId } = render(
      <Input name="email" icon="mail" placeholder="E-mail" />,
    );

    const inputElement = getByPlaceholder('E-mail');
    const containerElement = getByTestId('input-container');

    fireEvent(inputElement, 'onFocus');

    await waitFor(() => {
      expect(containerElement.props.isFocused).toBe(true);
      expect(containerElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderColor: '#ff9000',
          }),
        ]),
      );
    });

    fireEvent(inputElement, 'onBlur');

    await waitFor(() => {
      expect(containerElement.props.isFocused).toBe(false);
      expect(containerElement.props.style).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderColor: '#ff9000',
          }),
        ]),
      );
    });
  });

  it('should keep input border highlight when input filled', async () => {
    const { getByPlaceholder, getByTestId } = render(
      <Input name="email" icon="mail" placeholder="E-mail" />,
    );

    const inputElement = getByPlaceholder('E-mail');
    const containerElement = getByTestId('input-container');

    fireEvent.changeText(inputElement, 'johndoe@example.com');

    fireEvent(inputElement, 'onBlur');

    await waitFor(() => {
      expect(containerElement.props.isFilled).toBe(true);
      expect(containerElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderColor: '#ff9000',
          }),
        ]),
      );
    });
  });

  it('should render input without icon', async () => {
    const { getByPlaceholder, queryByTestId } = render(
      <Input name="email" placeholder="E-mail" />,
    );

    expect(getByPlaceholder('E-mail')).toBeTruthy();
    expect(queryByTestId('input-icon')).toBeNull();
  });

  it('should render error on input', async () => {
    mockedUnformFields.mockImplementation(() => ({
      fieldName: 'email',
      defaultValue: '',
      error: 'Informe o email',
      registerField: jest.fn(),
    }));

    const { getByTestId } = render(
      <Input name="email" icon="mail" placeholder="E-mail" />,
    );

    const containerElement = getByTestId('input-container');

    await waitFor(() => {
      expect(containerElement.props.isErrored).toBe(true);
      expect(containerElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderColor: '#c53030',
          }),
        ]),
      );
    });

    // const { getByTestId } = render(<Input name="email" placeholder="E-mail" />);

    // const tooltipContainer = getByTestId('tooltip-container');
    // const iconErrorElement = getByTestId('icon-error');

    // expect(tooltipContainer).toBeTruthy();
    // expect(iconErrorElement).toBeTruthy();
  });
});
