import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addTodo } from '@/lib/database';
import { colors } from '@/lib/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBg,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputLarge: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerButtonTextPlaceholder: {
    color: colors.textLight,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  priorityButtonTextSelected: {
    color: colors.white,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.lightBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  cancelButtonText: {
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text,
  },
});

const PREDEFINED_CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Learning'];
const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const;

export default function AddScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate.toISOString());
    }
  };

  const handleAddTodo = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      await addTodo({
        title: title.trim(),
        description: description.trim(),
        category: category || 'General',
        priority,
        dueDate,
        completed: false,
      });

      Alert.alert('Success', 'Task created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
      console.error('Failed to add todo:', error);
    }
  };

  const handleSelectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setCategory(newCategory.trim());
      setNewCategory('');
      setShowCategoryModal(false);
    }
  };

  const dueDateDisplay = dueDate
    ? new Date(dueDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Set due date';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Task</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task title"
            placeholderTextColor={colors.textLight}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.inputLarge]}
            placeholder="Add task details (optional)"
            placeholderTextColor={colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {PRIORITY_LEVELS.map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.priorityButton,
                  priority === level && styles.priorityButtonSelected,
                ]}
                onPress={() => setPriority(level)}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === level && styles.priorityButtonTextSelected,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.pickerButtonText}>{category}</Text>
            <MaterialIcons name="arrow-drop-down" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={[
                styles.pickerButtonText,
                !dueDate && styles.pickerButtonTextPlaceholder,
              ]}
            >
              {dueDateDisplay}
            </Text>
            <MaterialIcons name="calendar-today" size={20} color={colors.textLight} />
          </TouchableOpacity>
          {dueDate && (
            <TouchableOpacity
              onPress={() => setDueDate(null)}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: colors.secondary, fontSize: 14, fontWeight: '500' }}>
                Clear due date
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleAddTodo}
          >
            <Text style={styles.buttonText}>Create Task</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[...PREDEFINED_CATEGORIES]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectCategory(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled
            />

            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Text style={styles.label}>Or create new category</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Category name"
                  placeholderTextColor={colors.textLight}
                  value={newCategory}
                  onChangeText={setNewCategory}
                />
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, { paddingHorizontal: 16 }]}
                  onPress={handleAddNewCategory}
                >
                  <MaterialIcons name="add" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate ? new Date(dueDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}
