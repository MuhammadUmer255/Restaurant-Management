import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  FlatList,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Toast from '../components/Toast';
import { formatCurrency } from '../utils/currency';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  toggleMenuAvailability,
  deleteMenuItem,
} from '../services/menuService';

const CATEGORIES = ['All', 'Fast Food', 'Main Course', 'Drinks', 'Dessert'];

export default function MenuCrudScreen({ route, navigation }) {
  const authContext = useAuth() || {};
  const { isDark, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Role Detection
  const rawRole = route?.params?.role || authContext?.userRole || authContext?.user?.role || 'admin';
  const isAdmin = String(rawRole).trim().toLowerCase() === 'admin';

  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Active Selected Item State
  const [selectedDish, setSelectedDish] = useState(null);

  // Modal Visibilities
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState(null); // 'EDIT' or 'ADD'

  // Input States
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('Fast Food');

  // Toast State
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback((message, type = 'success') => {
    setToastConfig({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  // 📥 1. FETCH MENU FROM BACKEND
  const fetchMenu = async () => {
    try {
      const data = await getMenuItems();
      setMenuItems(data);
    } catch (error) {
      showToast(error?.message || 'Could not load menu from server.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMenu();
  };

  // Filter Menu
  const filteredMenu = useMemo(() => {
    return menuItems.filter(
      (item) => selectedCategory === 'All' || item.category === selectedCategory
    );
  }, [menuItems, selectedCategory]);

  const handleDishPress = useCallback((dish) => {
    if (!isAdmin) return;
    setSelectedDish(dish);
    setActionMenuVisible(true);
  }, [isAdmin]);

  const openAddModal = () => {
    setSelectedDish(null);
    setCurrentAction('ADD');
    setDishName('');
    setDishPrice('');
    setDishCategory('Fast Food');
    setFormModalVisible(true);
  };

  // 🔄 2. TOGGLE AVAILABILITY VIA BACKEND
  const toggleAvailability = useCallback(async (dish) => {
    try {
      const updatedStatus = !dish.available;
      await toggleMenuAvailability(dish.id, updatedStatus);
      setMenuItems((prev) =>
        prev.map((item) => (item.id === dish.id ? { ...item, available: updatedStatus } : item))
      );
      showToast(
        `${dish.name} is now ${updatedStatus ? 'In Stock' : 'Out of Stock'}`,
        'success'
      );
    } catch (error) {
      showToast(error?.message || 'Failed to update availability.', 'error');
    }
  }, [showToast]);

  const handleSelectAction = (action) => {
    setActionMenuVisible(false);

    if (action === 'DELETE') {
      setDeleteConfirmVisible(true);
      return;
    }

    if (action === 'TOGGLE_AVAILABILITY') {
      if (selectedDish) {
        toggleAvailability(selectedDish);
      }
      return;
    }

    setCurrentAction(action);

    if (action === 'EDIT' && selectedDish) {
      setDishName(selectedDish.name);
      setDishPrice(selectedDish.price.toString());
      setDishCategory(selectedDish.category);
    } else {
      setDishName('');
      setDishPrice('');
      setDishCategory('Fast Food');
    }

    setFormModalVisible(true);
  };

  // 🗑️ 3. DELETE DISH VIA BACKEND
  const confirmDeleteDish = async () => {
    if (!selectedDish) return;
    const dishId = selectedDish.id;
    const name = selectedDish.name;

    try {
      setSaving(true);
      await deleteMenuItem(dishId);
      setMenuItems((prev) => prev.filter((d) => d.id !== dishId));
      showToast(`${name} removed from menu!`, 'success');
    } catch (error) {
      showToast(error?.message || 'Failed to delete dish.', 'error');
    } finally {
      setSaving(false);
      setDeleteConfirmVisible(false);
      setSelectedDish(null);
    }
  };

  // 💾 4. ADD / EDIT DISH VIA BACKEND
  const handleSaveDish = async () => {
    if (!dishName.trim() || !dishPrice.trim()) {
      showToast('Please enter both dish name and price.', 'error');
      return;
    }

    const cleanPrice = parseFloat(dishPrice);
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      showToast('Please enter a valid positive price.', 'error');
      return;
    }

    setSaving(true);
    const trimmedName = dishName.trim();
    const payload = {
      name: trimmedName,
      price: cleanPrice,
      category: dishCategory,
      available: true,
    };

    try {
      if (currentAction === 'EDIT' && selectedDish) {
        const updated = await updateMenuItem(selectedDish.id, payload);
        setMenuItems((prev) =>
          prev.map((d) => (d.id === selectedDish.id ? { ...d, ...updated } : d))
        );
        showToast(`${trimmedName} updated successfully!`, 'success');
      } else {
        const created = await createMenuItem(payload);
        setMenuItems((prev) => [created, ...prev]);
        showToast(`${trimmedName} added to menu!`, 'success');
      }
      setFormModalVisible(false);
      setSelectedDish(null);
    } catch (err) {
      // Modal khula rehta hai agar save fail ho, taake user dobara try kar sake
      showToast(err?.message || 'Failed to save dish.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderMenuItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={isAdmin ? 0.7 : 1}
      onPress={() => handleDishPress(item)}
    >
      <View style={{ flex: 1, paddingRight: 10 }}>
        <View style={styles.nameRow}>
          <Text style={styles.dishName}>{item.name}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.available
                  ? 'rgba(53, 212, 155, 0.15)'
                  : 'rgba(255, 82, 106, 0.15)',
                borderColor: item.available
                  ? 'rgba(53, 212, 155, 0.3)'
                  : 'rgba(255, 82, 106, 0.3)',
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: item.available ? colors.success : colors.danger },
              ]}
            >
              {item.available ? '● In Stock' : '● Out of Stock'}
            </Text>
          </View>
        </View>
        <Text style={styles.categoryText}>Category: {item.category}</Text>
        <Text style={styles.priceText}>{formatCurrency(item.price)}</Text>
      </View>

      {isAdmin && (
        <View style={styles.tapIndicator}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.tapIndicatorText}>Manage</Text>
            <Ionicons name="chevron-forward-outline" size={12} color={colors.primary} style={{ marginLeft: 2 }} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  ), [isAdmin, handleDishPress, styles, colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
        translucent={false}
      />

      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onDismiss={hideToast}
      />

      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chevron-back-outline" size={16} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.roleBadgeContainer}>
          <Text style={styles.roleBadgeText}>
            {isAdmin ? '⚡ Admin Mode' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            Menu Management
          </Text>
          <Text style={styles.subtitle}>
            {filteredMenu.length} items listed
          </Text>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={openAddModal}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="add-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.addBtnText}>Add Dish</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 42, marginBottom: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.activeCategoryChip,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.activeCategoryChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredMenu}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 40, fontStyle: 'italic' }}>
              No dishes found in "{selectedCategory}".
            </Text>
          }
          renderItem={renderMenuItem}
        />
      )}

      {/* Action Context Sheet Modal */}
      {isAdmin && (
        <Modal
          visible={actionMenuVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setActionMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActionMenuVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedDish?.name || 'Dish Options'}
                </Text>
                <Text style={styles.modalSubtitle}>Select an action to perform:</Text>

                <TouchableOpacity
                  style={[styles.sheetOptionBtn, styles.editOptionBtn]}
                  onPress={() => handleSelectAction('EDIT')}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="create-outline" size={16} color={colors.success} style={{ marginRight: 8 }} />
                    <Text style={styles.editOptionText}>Edit Dish Details</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sheetOptionBtn, styles.toggleOptionBtn]}
                  onPress={() => handleSelectAction('TOGGLE_AVAILABILITY')}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="swap-horizontal-outline" size={16} color={colors.warning} style={{ marginRight: 8 }} />
                    <Text style={styles.toggleOptionText}>
                      Toggle Availability ({selectedDish?.available ? 'Mark Out of Stock' : 'Mark In Stock'})
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sheetOptionBtn, styles.deleteOptionBtn]}
                  onPress={() => handleSelectAction('DELETE')}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="trash-outline" size={16} color={colors.danger} style={{ marginRight: 8 }} />
                    <Text style={styles.deleteOptionText}>Delete Dish</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelSheetBtn}
                  onPress={() => setActionMenuVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isAdmin && (
        <Modal
          visible={deleteConfirmVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setDeleteConfirmVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDeleteConfirmVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Delete Dish</Text>
                <Text style={styles.modalSubtitle}>
                  Are you sure you want to remove {selectedDish?.name}?
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelModalBtn}
                    onPress={() => setDeleteConfirmVisible(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveModalBtn, { backgroundColor: colors.danger }]}
                    onPress={confirmDeleteDish}
                    activeOpacity={0.8}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.saveText}>Delete</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Form Modal */}
      {isAdmin && (
        <Modal
          visible={formModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setFormModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setFormModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ width: '100%' }}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {currentAction === 'EDIT' ? 'Edit Dish' : 'Add New Dish'}
                  </Text>

                  <Text style={styles.label}>Dish Name</Text>
                  <TextInput
                    style={styles.input}
                    value={dishName}
                    onChangeText={setDishName}
                    placeholder="e.g. Zinger Burger"
                    placeholderTextColor={colors.muted}
                  />

                  <Text style={styles.label}>Price (Rs.)</Text>
                  <TextInput
                    style={styles.input}
                    value={dishPrice}
                    onChangeText={(val) => setDishPrice(val.replace(/[^0-9.]/g, ''))}
                    keyboardType="numeric"
                    placeholder="550"
                    placeholderTextColor={colors.muted}
                  />

                  <Text style={styles.label}>Category</Text>
                  <View style={styles.chipRow}>
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.chip,
                          dishCategory === c && styles.activeChip,
                        ]}
                        onPress={() => setDishCategory(c)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            dishCategory === c && styles.activeChipText,
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.cancelModalBtn}
                      onPress={() => setFormModalVisible(false)}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveModalBtn}
                      onPress={handleSaveDish}
                      activeOpacity={0.8}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={styles.saveText}>Save Dish</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'android' ? 8 : 0,
      paddingBottom: 4,
    },
    backBtn: { paddingVertical: 4, paddingRight: 8 },
    backText: { color: c.primary, fontSize: 16, fontWeight: '600' },
    roleBadgeContainer: {
      backgroundColor: c.chip,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    roleBadgeText: { color: c.primary, fontSize: 11, fontWeight: '700' },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: { color: c.text, fontSize: 22, fontWeight: '700' },
    subtitle: { color: c.muted, fontSize: 12, marginTop: 2, fontWeight: '500' },
    addBtn: {
      backgroundColor: c.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
    categoryRow: { paddingHorizontal: 16, alignItems: 'center' },
    categoryChip: {
      backgroundColor: c.chip,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    activeCategoryChip: { backgroundColor: c.primary, borderColor: c.primary },
    categoryChipText: { color: c.icon, fontSize: 12, fontWeight: '600' },
    activeCategoryChipText: { color: '#FFF', fontWeight: '700' },
    listContainer: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 30 },
    card: {
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    dishName: { color: c.text, fontSize: 16, fontWeight: '700', marginRight: 8 },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
    },
    statusBadgeText: { fontSize: 10, fontWeight: '700' },
    categoryText: { color: c.muted, fontSize: 12, marginTop: 4 },
    priceText: { color: c.primary, fontSize: 14, fontWeight: '700', marginTop: 4 },
    tapIndicator: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: c.chip,
      borderWidth: 1,
      borderColor: c.border,
    },
    tapIndicatorText: { color: c.primary, fontSize: 11, fontWeight: '600' },
    sheetOptionBtn: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
    },
    editOptionBtn: {
      backgroundColor: 'rgba(53, 212, 155, 0.12)',
      borderColor: 'rgba(53, 212, 155, 0.3)',
    },
    editOptionText: { color: c.success, fontWeight: '700', fontSize: 13 },
    toggleOptionBtn: {
      backgroundColor: 'rgba(245, 174, 34, 0.12)',
      borderColor: 'rgba(245, 174, 34, 0.3)',
    },
    toggleOptionText: { color: c.warning, fontWeight: '700', fontSize: 13 },
    deleteOptionBtn: {
      backgroundColor: 'rgba(255, 82, 106, 0.12)',
      borderColor: 'rgba(255, 82, 106, 0.3)',
    },
    deleteOptionText: { color: c.danger, fontWeight: '700', fontSize: 13 },
    cancelSheetBtn: {
      alignItems: 'center',
      paddingVertical: 10,
      marginTop: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.75)',
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: c.card,
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    modalTitle: { color: c.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
    modalSubtitle: { color: c.muted, fontSize: 12, marginBottom: 16 },
    label: { color: c.icon, fontSize: 12, marginTop: 12, marginBottom: 6, fontWeight: '600' },
    input: {
      backgroundColor: c.bg,
      color: c.text,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      fontSize: 13,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
    chip: {
      backgroundColor: c.bg,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      marginRight: 6,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: c.border,
    },
    activeChip: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { color: c.icon, fontSize: 11 },
    activeChipText: { color: '#FFF', fontWeight: '700' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 22, alignItems: 'center' },
    cancelModalBtn: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
    cancelText: { color: c.icon, fontWeight: '600' },
    saveModalBtn: {
      backgroundColor: c.primary,
      paddingHorizontal: 22,
      paddingVertical: 10,
      borderRadius: 8,
    },
    saveText: { color: '#FFF', fontWeight: '700' },
  });