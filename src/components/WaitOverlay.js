import React from 'react';
import { View, ActivityIndicator, StyleSheet,Dimensions } from 'react-native';

const WaitOverlay = ({ visible }) => {
    const { width } = Dimensions.get('window');
    const size = width / 2;
    if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      {console.log('size', size)}
      <View style={styles.container}>
        <ActivityIndicator size={size} color="#ffffff" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 20,
  },
});

export default WaitOverlay;
