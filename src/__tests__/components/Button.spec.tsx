import React from 'react';
import { render } from 'react-native-testing-library';

import Button from '../../components/Button';

describe('Button component', () => {
  it('should be able render a button', () => {
    const { getByText } = render(<Button>Botão</Button>);

    expect(getByText('Botão')).toBeTruthy();
  });
});
