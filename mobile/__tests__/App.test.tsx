import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading screen initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('Loading ReelApps...')).toBeTruthy();
  });

  it('shows login screen when not authenticated', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByText('Sign in to your ReelCV account')).toBeTruthy();
    });
  });

  it('shows dashboard when authenticated', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('mock-token')
      .mockResolvedValueOnce('test@example.com');

    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText('Dashboard')).toBeTruthy();
    });
  });

  it('handles login flow correctly', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    const { getByText, getByPlaceholderText } = render(<App />);

    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    // Fill login form
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const loginButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-token');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
    });
  });

  it('handles logout correctly', async () => {
    // Start with authenticated state
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('mock-token')
      .mockResolvedValueOnce('test@example.com');

    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText('Dashboard')).toBeTruthy();
    });

    // Trigger logout
    const logoutButton = getByText('Sign Out');
    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['authToken', 'userEmail']);
      expect(getByText('Welcome Back')).toBeTruthy();
    });
  });

  it('displays error message for invalid login', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText, getByPlaceholderText } = render(<App />);

    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    // Try login with empty fields
    const loginButton = getByText('Sign In');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Please enter both email and password')).toBeTruthy();
    });
  });
});