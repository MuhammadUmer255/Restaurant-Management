import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';

const PAYMENT_METHODS = ['Cash', 'Credit Card', 'QR / Wallet'];

export default function BillingScreen({ route, navigation }) {
  const { isDark, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Receive dynamic data from route params or fallback
  const orderData = route?.params?.orderData || {
    table: 'T-02',
    customer: 'Julien',
    items: [
      { name: 'Truffle Wagyu Ribeye', price: 68.00 },
      { name: 'Yuzu Basil Smash', price: 28.00 },
    ],
  };

  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [cashTendered, setCashTendered] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');

  // Toast State
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message, type = 'success') => {
    setToastConfig({ visible: true, message, type });
  };

  const hideToast = () => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  };

  // Dynamic Auto-Calculations
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.price || 0), 0);
  const discountVal = parseFloat(discountPercent) || 0;
  const discountAmount = (subtotal * discountVal) / 100;
  const taxAmount = (subtotal - discountAmount) * 0.16; // 16% GST
  const grandTotal = subtotal - discountAmount + taxAmount;

  const cashGiven = parseFloat(cashTendered) || 0;
  const changeDue = cashGiven >= grandTotal ? cashGiven - grandTotal : 0;

  const handlePrintReceipt = () => {
    showToast('Receipt sent to printer!', 'success');
  };

  const handleSettlePayment = () => {
    if (selectedMethod === 'Cash' && cashGiven < grandTotal && subtotal > 0) {
      showToast('Insufficient cash! Given amount is less than total bill.', 'error');
      return;
    }

    showToast(`Payment of $${grandTotal.toFixed(2)} completed for Table ${orderData.table}!`, 'success');

    // Auto navigate back after showing toast feedback
    setTimeout(() => {
      navigation?.goBack();
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
        translucent={false}
      />

      {/* Top Floating Toast Notification */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onDismiss={hideToast}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chevron-back-outline" size={16} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            Checkout • Table {orderData.table}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.receiptBtn}
          onPress={handlePrintReceipt}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="print-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.receiptText}>Print</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Customer: {orderData.customer}</Text>
          <View style={styles.divider} />

          {orderData.items.length > 0 ? (
            orderData.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemQty}>1x</Text>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No items added to this order.</Text>
          )}
        </View>

        {/* Calculations Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Bill Calculation</Text>
          <View style={styles.divider} />

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Subtotal</Text>
            <Text style={styles.calcValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Discount (%)</Text>
            <TextInput
              style={styles.discountInput}
              keyboardType="numeric"
              value={discountPercent}
              onChangeText={setDiscountPercent}
              placeholder="0"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Tax / GST (16%)</Text>
            <Text style={styles.calcValue}>${taxAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Select Payment Method</Text>
          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodChip,
                  selectedMethod === method && styles.activeMethodChip,
                ]}
                onPress={() => setSelectedMethod(method)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.methodText,
                    selectedMethod === method && styles.activeMethodText,
                  ]}
                  numberOfLines={1}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cash Input & Change Calculation */}
          {selectedMethod === 'Cash' && (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.calcLabel}>Cash Received ($)</Text>
              <TextInput
                style={styles.cashInput}
                keyboardType="numeric"
                value={cashTendered}
                onChangeText={setCashTendered}
                placeholder={`Min $${grandTotal.toFixed(2)}`}
                placeholderTextColor={colors.muted}
              />
              <View style={[styles.calcRow, { marginTop: 10 }]}>
                <Text style={styles.calcLabel}>Change Due</Text>
                <Text style={styles.changeValue}>${changeDue.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Settle Action */}
        <TouchableOpacity style={styles.settleBtn} onPress={handleSettlePayment} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.settleBtnText}>Complete & Clear Table</Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },

    // Header
    header: {
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'android' ? 8 : 12,
      paddingBottom: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: c.headerBorder,
    },
    backBtn: { paddingVertical: 4, paddingRight: 8 },
    backText: { color: c.primary, fontSize: 16, fontWeight: '600' },
    headerTitleContainer: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
    title: { color: c.text, fontSize: 16, fontWeight: '700' },
    receiptBtn: {
      backgroundColor: c.chip,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    receiptText: { color: c.primary, fontWeight: '700', fontSize: 12 },

    // Scroll Content
    content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
    card: {
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardHeaderTitle: { color: c.text, fontSize: 15, fontWeight: '700' },
    divider: { height: 1, backgroundColor: c.border, marginVertical: 12 },

    // Items List
    itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    itemQty: { color: c.primary, fontWeight: '700', width: 28 },
    itemName: { color: c.label, flex: 1, fontSize: 13, paddingRight: 8 },
    itemPrice: { color: c.text, fontWeight: '600', fontSize: 13 },
    emptyText: { color: c.muted, fontStyle: 'italic', paddingVertical: 6 },

    // Calculations
    calcRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 6,
    },
    calcLabel: { color: c.muted, fontSize: 13, fontWeight: '500' },
    calcValue: { color: c.text, fontWeight: '600', fontSize: 13 },
    discountInput: {
      backgroundColor: c.bg,
      color: c.text,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: c.border,
      width: 65,
      textAlign: 'center',
      fontSize: 13,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    totalLabel: { color: c.text, fontSize: 16, fontWeight: '700' },
    totalValue: { color: c.success, fontSize: 22, fontWeight: '700' },

    // Payment Chips Layout
    methodRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    methodChip: {
      flex: 1,
      backgroundColor: c.chip,
      paddingVertical: 10,
      marginHorizontal: 3,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    activeMethodChip: { backgroundColor: c.primary, borderColor: c.primary },
    methodText: { color: c.icon, fontSize: 11, fontWeight: '600' },
    activeMethodText: { color: '#FFF', fontWeight: '700' },

    // Cash Input
    cashInput: {
      backgroundColor: c.bg,
      color: c.text,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      marginTop: 6,
      fontSize: 13,
    },
    changeValue: { color: c.warning, fontWeight: '700', fontSize: 16 },

    // Settle Button
    settleBtn: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    settleBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  });