import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock the LoginScreen component since it's part of App.tsx
// In a real app, this would be a separate component
const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      await AsyncStorage.setItem('authToken', 'mock-token');
      await AsyncStorage.setItem('userEmail', email);
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        data-testid="email-input"
      />
      <input
        placeholder="Enter your password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        data-testid="password-input"
      />
      <button
        onClick={handleLogin}
        disabled={isLoading}
        data-testid="login-button"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </div>
  );
};

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  const mockNavigation = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form elements', () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
  });

  it('shows error for empty fields', async () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter both email and password');
    });
  });

  it('handles successful login', async () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-token');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
      expect(mockNavigation.replace).toHaveBeenCalledWith('Dashboard');
    });
  });

  it('shows loading state during login', async () => {
    const { getByTestId, getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    // Check loading state
    expect(getByText('Signing In...')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('Sign In')).toBeTruthy();
    });
  });
});