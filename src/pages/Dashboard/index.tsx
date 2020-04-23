import React, { useCallback } from 'react';
import { View, Button } from 'react-native';

import { useAuth } from '../../hooks/auth';

const Dashboard: React.FC = () => {
  const { signOut } = useAuth();

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Sair" onPress={handleSignOut} />
    </View>
  );
};

export default Dashboard;
