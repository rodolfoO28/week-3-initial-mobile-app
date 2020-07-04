import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';

import { NativeModules } from 'react-native';

global.FormData = () => {
  return {
    append: jest.fn(),
  };
};

// Mock the ImagePickerManager native module to allow us to unit test the JavaScript code
NativeModules.ImagePickerManager = {
  showImagePicker: jest.fn(),
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
};

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);
