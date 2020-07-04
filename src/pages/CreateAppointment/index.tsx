import React, { useCallback, useEffect, useState, useMemo } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { Platform, Alert } from 'react-native';
import { format } from 'date-fns';

import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useAuth } from '../../hooks/auth';

import api from '../../services/api';

import { Provider, AvailabilityItem } from './types';

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  Content,
  ProvidersListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  CalendarTitle,
  CalendarDatePickerButton,
  CalendarDatePickerButtonText,
  Schedule,
  ScheduleTitle,
  ScheduleSection,
  ScheduleSectionTitle,
  ScheduleSectionContent,
  ScheduleSectionContentHour,
  ScheduleSectionContentHourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
} from './styles';

interface RouteParams {
  providerId: string;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const { goBack, navigate } = useNavigation();

  const route = useRoute();
  const routeParams = route.params as RouteParams;

  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedHour, setSelectedHour] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId,
  );

  const handleDateChanged = useCallback(
    (event: any, date: Date | undefined) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }

      setSelectedDate(date);
    },
    [],
  );

  useEffect(() => {
    api.get('providers').then((response) => {
      setProviders(response.data);
    });
  }, []);

  useEffect(() => {
    api
      .get(`providers/${selectedProvider}/day-availability`, {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then((response) => {
        setAvailability(response.data);
        handleDateChanged(null, selectedDate);
      });
  }, [selectedProvider, selectedDate, handleDateChanged]);

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToogleDatePicker = useCallback(() => {
    setShowDatePicker((state) => !state);
  }, []);

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const providerName = useMemo(() => {
    const provider = providers.find(
      (providerItem) => providerItem.id === selectedProvider,
    );

    return provider?.name ?? '';
  }, [providers, selectedProvider]);

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);
      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', {
        provider_id: selectedProvider,
        date,
      });

      navigate('AppointmentCreated', {
        date: date.getTime(),
        provider: providerName,
      });
    } catch (err) {
      Alert.alert(
        'Erro ao criar agendamento',
        'Ocorreu um erro ao tentar criar o agendamento, tente novamente.',
      );
    }
  }, [navigate, selectedDate, selectedHour, selectedProvider, providerName]);

  const morningAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [availability]);

  return (
    <Container>
      <Header>
        <BackButton testID="go-back-button" onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>

        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar source={{ uri: user.avatar_url }} />
      </Header>

      <Content>
        <ProvidersListContainer>
          <ProvidersList
            testID="provider-list"
            horizontal
            contentContainerStyle={{ paddingHorizontal: 24 }}
            showsHorizontalScrollIndicator={false}
            data={providers}
            keyExtractor={(provider) => provider.id}
            renderItem={({ item: provider }) => (
              <ProviderContainer
                testID={provider.id}
                onPress={() => handleSelectProvider(provider.id)}
                selected={provider.id === selectedProvider}
              >
                <ProviderAvatar source={{ uri: provider.avatar_url }} />
                <ProviderName selected={provider.id === selectedProvider}>
                  {provider.name}
                </ProviderName>
              </ProviderContainer>
            )}
          />
        </ProvidersListContainer>

        <Calendar>
          <CalendarTitle>Escolha a data</CalendarTitle>

          <CalendarDatePickerButton
            testID="calendar-picker-button"
            onPress={handleToogleDatePicker}
          >
            <CalendarDatePickerButtonText>
              Selecionar outra data
            </CalendarDatePickerButtonText>
          </CalendarDatePickerButton>

          {showDatePicker && (
            <DateTimePicker
              testID="date-picker"
              mode="date"
              display="calendar"
              onChange={handleDateChanged}
              textColor="#f4ede8"
              value={selectedDate}
            />
          )}
        </Calendar>

        <Schedule>
          <ScheduleTitle>Escolha o horário</ScheduleTitle>

          <ScheduleSection>
            <ScheduleSectionTitle>Manhã</ScheduleSectionTitle>
            <ScheduleSectionContent>
              {morningAvailability.map(({ hourFormatted, hour, available }) => (
                <ScheduleSectionContentHour
                  testID={`schedule-${hour}`}
                  enabled={available}
                  selected={selectedHour === hour}
                  available={available}
                  key={hourFormatted}
                  onPress={() => handleSelectHour(hour)}
                >
                  <ScheduleSectionContentHourText
                    selected={selectedHour === hour}
                  >
                    {hourFormatted}
                  </ScheduleSectionContentHourText>
                </ScheduleSectionContentHour>
              ))}
            </ScheduleSectionContent>
          </ScheduleSection>

          <ScheduleSection>
            <ScheduleSectionTitle>Tarde</ScheduleSectionTitle>
            <ScheduleSectionContent>
              {afternoonAvailability.map(
                ({ hourFormatted, hour, available }) => (
                  <ScheduleSectionContentHour
                    testID={`schedule-${hour}`}
                    enabled={available}
                    selected={selectedHour === hour}
                    available={available}
                    key={hourFormatted}
                    onPress={() => handleSelectHour(hour)}
                  >
                    <ScheduleSectionContentHourText
                      selected={selectedHour === hour}
                    >
                      {hourFormatted}
                    </ScheduleSectionContentHourText>
                  </ScheduleSectionContentHour>
                ),
              )}
            </ScheduleSectionContent>
          </ScheduleSection>
        </Schedule>

        <CreateAppointmentButton
          testID="create-appointment-button"
          onPress={handleCreateAppointment}
        >
          <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
        </CreateAppointmentButton>
      </Content>
    </Container>
  );
};

export default CreateAppointment;
