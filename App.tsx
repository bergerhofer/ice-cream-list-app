/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';

// API configuration
const API_BASE_URL = 'https://0snjzvy2ca.execute-api.us-east-1.amazonaws.com/dev';

interface IceCreamFlavor {
  id: string;
  name: string;
  userId?: string;
}

interface User {
  username: string;
  email: string;
}

function App(): React.JSX.Element {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFlavor, setNewFlavor] = useState('');
  const [iceCreamList, setIceCreamList] = useState<IceCreamFlavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingFlavor, setAddingFlavor] = useState(false);
  
  // Simple authentication states (local only for now)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  
  // Sign in/up states
  const [isSignInModalVisible, setIsSignInModalVisible] = useState(false);
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load ice cream flavors when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchIceCreamFlavors();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Simple local authentication (for demo purposes)
  const signInUser = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setAuthLoading(true);
      // Simple validation - in real app this would call AWS Cognito
      if (password.length >= 8) {
        setIsAuthenticated(true);
        setUser({
          username: email,
          email: email,
        });
        setIsSignInModalVisible(false);
        setEmail('');
        setPassword('');
      } else {
        Alert.alert('Error', 'Password must be at least 8 characters');
      }
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message || 'Failed to sign in');
    } finally {
      setAuthLoading(false);
    }
  };

  const signUpUser = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setAuthLoading(true);
      // Simple account creation - in real app this would call AWS Cognito
      Alert.alert(
        'Success',
        'Account created! You can now sign in.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsSignUpModalVisible(false);
              setIsSignInModalVisible(true);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message || 'Failed to create account');
    } finally {
      setAuthLoading(false);
    }
  };

  const signOutUser = async () => {
    setIsAuthenticated(false);
    setUser(null);
    setIceCreamList([]);
    setLoading(false);
  };

  // Fetch ice cream flavors from API
  const fetchIceCreamFlavors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/icecream`);
      if (response.ok) {
        const data = await response.json();
        // Filter data by userId if user is authenticated
        const userData = user?.email 
          ? data.filter((item: IceCreamFlavor) => item.userId === user.email)
          : data;
        setIceCreamList(userData || []);
      } else {
        Alert.alert('Error', 'Failed to load ice cream flavors');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while loading flavors');
    } finally {
      setLoading(false);
    }
  };

  // Add new ice cream flavor to API
  const addIceCream = async () => {
    const trimmedFlavor = newFlavor.trim();
    
    // Check for empty input
    if (!trimmedFlavor) {
      Alert.alert(
        'Empty Flavor',
        'Please enter an ice cream flavor name.',
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
      return;
    }
    
    // Check for length limit
    if (trimmedFlavor.length > 45) {
      Alert.alert(
        'Name Too Long',
        'Ice cream flavor names must be 45 characters or less.',
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
      return;
    }
    
    // Check if flavor already exists (case-insensitive) in user's list
    const flavorExists = iceCreamList.some(
      flavor => flavor.name.toLowerCase() === trimmedFlavor.toLowerCase()
    );
    
    if (flavorExists) {
      Alert.alert(
        'Duplicate Flavor',
        `"${trimmedFlavor}" is already in your list!`,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
      return;
    }
    
    try {
      setAddingFlavor(true);
      const newId = Date.now().toString(); // Generate unique ID
      const newFlavorData = {
        id: newId,
        name: trimmedFlavor,
        userId: user?.email || 'anonymous',
      };
      
      const response = await fetch(`${API_BASE_URL}/icecream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFlavorData),
      });
      
      if (response.ok) {
        setIceCreamList([...iceCreamList, newFlavorData]);
        setNewFlavor('');
        setIsModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to add ice cream flavor');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while adding flavor');
    } finally {
      setAddingFlavor(false);
    }
  };

  const closeModal = () => {
    setNewFlavor('');
    setIsModalVisible(false);
  };

  // Delete ice cream flavor from API
  const deleteIceCream = (flavor: IceCreamFlavor) => {
    Alert.alert(
      'Delete Ice Cream',
      `Are you sure you want to delete "${flavor.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/icecream/object/${flavor.id}`, {
                method: 'DELETE',
              });
              
              if (response.ok) {
                const newList = iceCreamList.filter(item => item.id !== flavor.id);
                setIceCreamList(newList);
              } else {
                Alert.alert('Error', 'Failed to delete ice cream flavor');
              }
            } catch (error) {
              Alert.alert('Error', 'Network error while deleting flavor');
            }
          },
        },
      ]
    );
  };

  const renderIceCreamItem = ({item}: {item: IceCreamFlavor}) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>{item.name}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteIceCream(item)}>
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Ice Cream App</Text>
          <Text style={styles.authSubtitle}>Sign in to manage your ice cream flavors</Text>
          
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => setIsSignInModalVisible(true)}>
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.authButtonSecondary}
            onPress={() => setIsSignUpModalVisible(true)}>
            <Text style={styles.authButtonSecondaryText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Modal */}
        <Modal
          visible={isSignInModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsSignInModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sign In</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!authLoading}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                editable={!authLoading}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.cancelButton, authLoading && styles.disabledButton]} 
                  onPress={() => {
                    setIsSignInModalVisible(false);
                    setEmail('');
                    setPassword('');
                  }}
                  disabled={authLoading}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, authLoading && styles.disabledButton]} 
                  onPress={signInUser}
                  disabled={authLoading}>
                  {authLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Sign Up Modal */}
        <Modal
          visible={isSignUpModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsSignUpModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Account</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!authLoading}
              />
              <TextInput
                style={styles.input}
                placeholder="Password (min 8 characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                editable={!authLoading}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                editable={!authLoading}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.cancelButton, authLoading && styles.disabledButton]} 
                  onPress={() => {
                    setIsSignUpModalVisible(false);
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={authLoading}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, authLoading && styles.disabledButton]} 
                  onPress={signUpUser}
                  disabled={authLoading}>
                  {authLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Show main app if authenticated
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF69B4" />
          <Text style={styles.loadingText}>Loading ice cream flavors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ice Cream List</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}>
            <Text style={styles.plusIcon}>+</Text>
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={signOutUser}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={iceCreamList}
        renderItem={renderIceCreamItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No ice cream flavors yet!</Text>
        }
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Ice Cream Flavor</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter ice cream flavor..."
              value={newFlavor}
              onChangeText={setNewFlavor}
              maxLength={45}
              autoFocus={true}
              editable={!addingFlavor}
            />
            <Text style={styles.charCount}>
              {newFlavor.length}/45 characters
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, addingFlavor && styles.disabledButton]} 
                onPress={closeModal}
                disabled={addingFlavor}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, addingFlavor && styles.disabledButton]} 
                onPress={addIceCream}
                disabled={addingFlavor}>
                {addingFlavor ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF69B4',
    marginBottom: 10,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  authButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    width: '100%',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  authButtonSecondary: {
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF69B4',
    width: '100%',
  },
  authButtonSecondaryText: {
    color: '#FF69B4',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF69B4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  plusIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  signOutButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF69B4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#ff4757',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF69B4',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF69B4',
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
  },
});

export default App;
