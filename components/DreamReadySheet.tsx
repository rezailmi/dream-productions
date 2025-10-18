import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dream } from '../constants/Types';
import Colors from '../constants/Colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface DreamReadySheetProps {
  visible: boolean;
  dream: Dream | null;
  onClose: () => void;
  onPlayDream: () => void;
  onShare?: () => void;
}

export function DreamReadySheet({
  visible,
  dream,
  onClose,
  onPlayDream,
  onShare,
}: DreamReadySheetProps) {
  const [dreamNote, setDreamNote] = useState('');

  if (!dream) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>{getGreeting()}</Text>

            <TouchableOpacity
              onPress={onShare}
              style={styles.headerButton}
              disabled={!onShare}
            >
              <Ionicons
                name="share-outline"
                size={24}
                color={onShare ? Colors.text : 'transparent'}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.readyText}>Your dream reel is ready.</Text>

            {/* Dream preview circle */}
            <View style={styles.previewContainer}>
              <View style={styles.previewCircle}>
                {dream.videoUrl ? (
                  <View style={styles.videoPlaceholder}>
                    <Ionicons name="play-circle" size={80} color={Colors.primary} />
                  </View>
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Ionicons name="film-outline" size={60} color={Colors.textMuted} />
                  </View>
                )}
              </View>
            </View>

            {/* Play button */}
            <TouchableOpacity
              style={styles.playButton}
              onPress={onPlayDream}
            >
              <Ionicons name="play" size={20} color="#000000" />
              <Text style={styles.playButtonText}>Play the dream</Text>
            </TouchableOpacity>

            {/* Text input instead of voice */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Tell what I dreamed about"
                placeholderTextColor={Colors.textMuted}
                value={dreamNote}
                onChangeText={setDreamNote}
                multiline
                numberOfLines={2}
                textAlignVertical="center"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#C0C0C0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 24,
  },
  readyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  previewCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  videoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    marginBottom: 16,
    gap: 8,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  inputContainer: {
    backgroundColor: '#E8E8E8',
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  textInput: {
    fontSize: 16,
    color: '#000000',
    minHeight: 48,
    maxHeight: 80,
  },
});
