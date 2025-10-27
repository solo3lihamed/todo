import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getAllTodos,
  deleteTodo,
  updateTodo,
  searchTodos,
  getCategories,
  type Todo,
} from '@/lib/database';
import { colors, priorityColors } from '@/lib/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBg,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 100,
  },
  todoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  todoCardCompleted: {
    opacity: 0.6,
    backgroundColor: '#F3F4F6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  todoDescription: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8,
  },
  todoBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  todoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.lightBg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    color: colors.textLight,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const loadTodosCallback = useCallback(async () => {
    try {
      const allTodos = await getAllTodos();
      setTodos(allTodos);
      filterTodos(allTodos, searchQuery, selectedCategory);

      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, [searchQuery, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      loadTodosCallback();
    }, [loadTodosCallback])
  );



  const filterTodos = (
    todosToFilter: Todo[],
    query: string,
    category: string | null
  ) => {
    let filtered = todosToFilter;

    if (category) {
      filtered = filtered.filter(todo => todo.category === category);
    }

    if (query.trim()) {
      filtered = filtered.filter(
        todo =>
          todo.title.toLowerCase().includes(query.toLowerCase()) ||
          todo.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredTodos(filtered);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const results = await searchTodos(query);
        let filtered = results;
        if (selectedCategory) {
          filtered = filtered.filter(todo => todo.category === selectedCategory);
        }
        setFilteredTodos(filtered);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      filterTodos(todos, '', selectedCategory);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      await updateTodo(todo.id, { completed: !todo.completed });
      loadTodosCallback();
    } catch {
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  const handleDeleteTodo = (id: number, title: string) => {
    Alert.alert(
      'Delete Todo',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteTodo(id);
              loadTodosCallback();
            } catch {
              Alert.alert('Error', 'Failed to delete todo');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditTodo = (todo: Todo) => {
    router.push({
      pathname: '/edit',
      params: { id: todo.id.toString() },
    });
  };

  const handleCategoryFilter = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    filterTodos(todos, searchQuery, newCategory);
  };

  const completedCount = filteredTodos.filter(t => t.completed).length;
  const totalCount = filteredTodos.length;

  const getPriorityColor = (priority: string) => {
    return priorityColors[priority as keyof typeof priorityColors] || colors.primary;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>Stay organized & productive</Text>
        </View>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <MaterialIcons name="close" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {categories.length > 0 && (
        <ScrollView
          style={styles.filterContainer}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              !selectedCategory && styles.filterButtonActive,
            ]}
            onPress={() => handleCategoryFilter(selectedCategory || 'All')}
          >
            <Text
              style={[
                styles.filterButtonText,
                !selectedCategory && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategory === category && styles.filterButtonActive,
              ]}
              onPress={() => handleCategoryFilter(category)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedCategory === category && styles.filterButtonTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {filteredTodos.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalCount - completedCount}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>
      )}

      {filteredTodos.length > 0 ? (
        <FlatList
          data={filteredTodos}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.contentContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.todoCard, item.completed && styles.todoCardCompleted]}
              onPress={() => handleEditTodo(item)}
              activeOpacity={0.7}
            >
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  item.completed && styles.checkboxChecked,
                ]}
                onPress={() => handleToggleTodo(item)}
              >
                {item.completed && (
                  <MaterialIcons name="check" size={16} color={colors.white} />
                )}
              </TouchableOpacity>

              <View style={styles.todoContent}>
                <Text
                  style={[
                    styles.todoTitle,
                    item.completed && styles.todoTitleCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.description ? (
                  <Text
                    style={styles.todoDescription}
                    numberOfLines={1}
                  >
                    {item.description}
                  </Text>
                ) : null}

                <View style={styles.todoBadges}>
                  <View style={[styles.badge, { backgroundColor: getPriorityColor(item.priority) }]}>
                    <Text style={styles.badgeText}>
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                    </Text>
                  </View>
                  {item.category && (
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.badgeText}>{item.category}</Text>
                    </View>
                  )}
                  {item.dueDate && (
                    <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                      <Text style={styles.badgeText}>
                        {new Date(item.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.todoActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditTodo(item)}
                >
                  <MaterialIcons name="edit" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteTodo(item.id, item.title)}
                >
                  <MaterialIcons name="delete" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? 'Try a different search term'
              : 'Create your first task to get started'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add')}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
