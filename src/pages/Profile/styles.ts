import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 30px 40px;
`;

export const BackButton = styled.TouchableOpacity`
  margin-top: 40px;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-family: 'RobotoSlab-Medium';
  color: #f4ede8;
  padding: 64px 0 24px 0;
`;

export const UserAvatarButton = styled.TouchableOpacity`
  width: 186px;
  height: 186px;
  margin: 0 auto;
  position: relative;
`;

export const UserAvatar = styled.Image`
  width: 186px;
  height: 186px;
  border-radius: 93px;
`;

export const CameraIcon = styled.View`
  background: #ff9900;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  position: absolute;
  bottom: 0;
  right: 0;
`;
