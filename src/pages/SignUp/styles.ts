import styled from 'styled-components/native';
import { Platform } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';

export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 0 30px ${Platform.OS === 'android' ? 140 : 40}px;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-family: 'RobotoSlab-Medium';
  color: #f4ede8;
  padding: 64px 0 24px 0;
`;

export const BackToSignIn = styled.TouchableOpacity`
  /* position: absolute;
  bottom: 0;
  left: 0;
  right: 0; */

  background: #312e38;
  border-top-width: 1px;
  border-color: #232129;
  padding: 16px 0 ${16 + getBottomSpace()}px 0;

  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const BackToSignInText = styled.Text`
  color: #fff;
  margin-left: 16px;
  font-size: 16px;
  font-family: 'RobotoSlab-Regular';
`;
