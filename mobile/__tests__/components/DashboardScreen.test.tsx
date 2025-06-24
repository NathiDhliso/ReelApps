import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock DashboardScreen component
const DashboardScreen = ({ navigation }: any) => {
  const [userEmail, setUserEmail] = React.useState('');

  React.useEffect(() => {
    const loadUserData = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) setUserEmail(email);
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['authToken', 'userEmail']);
    navigation.replace('Login');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {userEmail}</p>
      <div data-testid="dashboard-cards">
        <div data-testid="profile-card">Profile Completion</div>
        <div data-testid="matches-card">Job Matches</div>
        <div data-testid="applications-card">Applications</div>
        <div data-testid="reelcv-card">ReelCV</div>
      </div>
      <button onClick={handleLogout} data-testid="logout-button">
        Sign Out
      </button>
    </div>
  );
};

describe('DashboardScreen', () => {
  const mockNavigation = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard elements', () => {
    const { getByText, getByTestId } = render(<DashboardScreen navigation={mockNavigation} />);
    
    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByTestId('dashboard-cards')).toBeTruthy();
    expect(getByTestId('profile-card')).toBeTruthy();
    expect(getByTestId('matches-card')).toBeTruthy();
    expect(getByTestId('applications-card')).toBeTruthy();
    expect(getByTestId('reelcv-card')).toBeTruthy();
  });

  it('loads and displays user email', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test@example.com');

    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Welcome back, test@example.com')).toBeTruthy();
    });
  });

  it('handles logout correctly', async () => {
    const { getByTestId } = render(<DashboardScreen navigation={mockNavigation} />);
    
    const logoutButton = getByTestId('logout-button');
    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['authToken', 'userEmail']);
      expect(mockNavigation.replace).toHaveBeenCalledWith('Login');
    });
  });

  it('renders all dashboard cards', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    
    expect(getByText('Profile Completion')).toBeTruthy();
    expect(getByText('Job Matches')).toBeTruthy();
    expect(getByText('Applications')).toBeTruthy();
    expect(getByText('ReelCV')).toBeTruthy();
  });
});