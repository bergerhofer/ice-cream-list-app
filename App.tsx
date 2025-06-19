/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
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
} from 'react-native';

function App(): React.JSX.Element {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFlavor, setNewFlavor] = useState('');
  const [iceCreamList, setIceCreamList] = useState<string[]>([]);

  const addIceCream = () => {
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
      flavor => flavor.toLowerCase() === trimmedFlavor.toLowerCase()
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
    
    setIceCreamList([...iceCreamList, trimmedFlavor]);
    setNewFlavor('');
    setIsModalVisible(false);
  };

  const closeModal = () => {
    setNewFlavor('');
    setIsModalVisible(false);
  };

  const deleteIceCream = (index: number) => {
    Alert.alert(
      'Delete Ice Cream',
      `Are you sure you want to delete "${iceCreamList[index]}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newList = iceCreamList.filter((_, i) => i !== index);
            setIceCreamList(newList);
          },
        },
      ]
    );
  };

  const renderIceCreamItem = ({item, index}: {item: string; index: number}) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>{item}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteIceCream(index)}>
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

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
        keyExtractor={(item, index) => index.toString()}
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
            />
            <Text style={styles.charCount}>
              {newFlavor.length}/45 characters
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addIceCream}>
                <Text style={styles.saveButtonText}>Add</Text>
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
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
  },
});

export default App;
