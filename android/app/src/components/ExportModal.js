import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Alert } from 'react-native';

const ExportModal = ({ visible, onClose, timeFilter = 'Day' }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = (format) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      onClose();
      Alert.alert('Report Exported', `${timeFilter}-wise sales report downloaded as ${format}!`);
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Export Sales Report</Text>
          <Text style={styles.subtitle}>Select file format for {timeFilter}-wise report</Text>

          <TouchableOpacity
            style={[styles.exportOption, { backgroundColor: '#E65100' }]}
            onPress={() => handleDownload('PDF')}
            disabled={downloading}
          >
            <Text style={styles.optionText}>📄 Export as PDF Document</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportOption, { backgroundColor: '#1B5E20' }]}
            onPress={() => handleDownload('Excel (.xlsx)')}
            disabled={downloading}
          >
            <Text style={styles.optionText}>📊 Export as Excel Sheet (.xlsx)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={downloading}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#161D2F',
    width: '100%',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#232D42',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#8A94A6',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  exportOption: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 6,
  },
  cancelText: {
    color: '#8A94A6',
    fontSize: 13,
  },
});

export default ExportModal;