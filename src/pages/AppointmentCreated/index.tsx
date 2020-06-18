import React, { useCallback, useMemo } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Container,
  Title,
  Description,
  OkButton,
  OkButtonText,
} from './styles';

interface RouteParams {
  date: number;
  provider: string;
}

const AppointmentCreated: React.FC = () => {
  const { reset } = useNavigation();

  const routes = useRoute();
  const routeParams = routes.params as RouteParams;

  const formattedDescription = useMemo(() => {
    return format(
      routeParams.date,
      `EEEE', dia' dd 'de' MMMM 'de' yyyy 'às' HH:00'h com ${routeParams.provider}'`,
      { locale: ptBR },
    );
  }, [routeParams.date, routeParams.provider]);

  const handleOkPressed = useCallback(() => {
    reset({
      routes: [{ name: 'Dashboard' }],
      index: 0,
    });
  }, [reset]);

  return (
    <Container>
      <Icon name="check" size={80} color="#04d361" />

      <Title>Agendamento concluído</Title>
      <Description>{formattedDescription}</Description>

      <OkButton onPress={handleOkPressed}>
        <OkButtonText>Ok</OkButtonText>
      </OkButton>
    </Container>
  );
};

export default AppointmentCreated;
