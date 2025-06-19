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
}

function App(): React.JSX.Element {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFlavor, setNewFlavor] = useState('');
  const [iceCreamList, setIceCreamList] = useState<IceCreamFlavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingFlavor, setAddingFlavor] = useState(false);

  // Fetch ice cream flavors from API
  const fetchIceCreamFlavors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/icecream`);
      if (response.ok) {
        const data = await response.json();
        setIceCreamList(data || []);
      } else {
        Alert.alert('Error', 'Failed to load ice cream flavors');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while loading flavors');
    } finally {
      setLoading(false);
    }
  };

  // Load flavors on app start
  useEffect(() => {
    fetchIceCreamFlavors();
  }, []);

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
    
    // Check if flavor already exists (case-insensitive)
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
        <Text style={styles.title}>Ice Cream List</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}>
          <Text style={styles.plusIcon}>+</Text>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF69B4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
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
