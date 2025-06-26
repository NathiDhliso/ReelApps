import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Shared color tokens from web globals.css
const Colors = {
  brandDeepOcean: '#0A2540',
  brandTurquoise: '#38B2AC',
  brandTurquoiseLight: '#4FD1C7',
  accentGreen: '#38A169',
  accentRed: '#E53E3E',
  bgPrimary: '#F7F9FC',
  bgSecondary: '#FFFFFF',
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  borderPrimary: '#E2E8F0',
};

const Stack = createStackNavigator();

// Login Screen Component
const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store auth token (mock)
      await AsyncStorage.setItem('authToken', 'mock-token');
      await AsyncStorage.setItem('userEmail', email);
      
      navigation.replace('Dashboard');
    } catch (_error) {
      Alert.alert('Login Failed', 'Please check your credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.loginContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>R</Text>
            </View>
            <Text style={styles.logoText}>ReelApps</Text>
          </View>
          
          <Text style={styles.loginTitle}>Welcome Back</Text>
          <Text style={styles.loginSubtitle}>Sign in to your ReelCV account</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Dashboard Screen Component
const DashboardScreen = ({ navigation }: any) => {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        setUserEmail(email);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userEmail']);
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const dashboardItems = [
    { title: 'Profile Completion', description: 'Complete your profile to get better matches', color: Colors.brandTurquoise },
    { title: 'Job Matches', description: 'View your latest job recommendations', color: Colors.accentGreen },
    { title: 'Applications', description: 'Track your job applications', color: Colors.brandDeepOcean },
    { title: 'ReelCV', description: 'Manage your video CV showcase', color: Colors.brandTurquoiseLight },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.dashboardContainer}>
          <View style={styles.dashboardHeader}>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
            <Text style={styles.dashboardSubtitle}>Welcome back, {userEmail}</Text>
          </View>
          
          <View style={styles.dashboardGrid}>
            {dashboardItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.dashboardCard}>
                <View style={[styles.cardIcon, { backgroundColor: item.color }]} />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading ReelApps...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Dashboard' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.brandDeepOcean,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ 
            title: 'ReelApps',
            headerLeft: () => null,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollView: {
    backgroundColor: Colors.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  loginContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    minHeight: 600,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.brandTurquoise,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.borderPrimary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.bgSecondary,
    color: Colors.textPrimary,
  },
  loginButton: {
    backgroundColor: Colors.brandTurquoise,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dashboardContainer: {
    flex: 1,
    padding: 24,
  },
  dashboardHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  dashboardSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  dashboardCard: {
    width: '48%',
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
    alignItems: 'center',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  logoutButton: {
    backgroundColor: Colors.accentRed,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;