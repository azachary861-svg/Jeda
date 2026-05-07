import { useState } from 'react';
import { StyleSheet, Pressable, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text, View } from '@/components/Themed';
import { uploadTripMedia } from '@/services/media-upload';

export default function UploadScreen() {
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const pickFromCamera = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      setStatus('Izin kamera ditolak');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;
    setMediaUri(result.assets[0].uri);
    setStatus('Media dipilih dari kamera.');
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      setStatus('Izin galeri ditolak');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]) return;
    setMediaUri(result.assets[0].uri);
    setStatus('Media dipilih dari galeri.');
  };

  const uploadSelectedMedia = async () => {
    if (!mediaUri) {
      setStatus('Pilih media terlebih dahulu.');
      return;
    }

    try {
      setStatus('Mengunggah media...');
      await uploadTripMedia({
        uri: mediaUri,
        caption: 'Upload dari aplikasi driver',
      });
      setStatus('Upload berhasil.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload gagal.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Media Upload</Text>
      <Text style={styles.desc}>Upload foto/video trip untuk feed klien dan penjualan media.</Text>
      <Pressable style={styles.button} onPress={pickFromCamera}>
        <Text style={styles.buttonText}>Ambil Foto</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.secondary]} onPress={pickFromLibrary}>
        <Text style={styles.secondaryText}>Pilih dari Galeri</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={uploadSelectedMedia}>
        <Text style={styles.buttonText}>Upload ke Trip Feed</Text>
      </Pressable>

      {mediaUri ? <Image source={{ uri: mediaUri }} style={styles.preview} resizeMode="cover" /> : null}
      {status ? <Text>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  desc: {
    opacity: 0.7,
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#0f766e',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: '#e2e8f0',
  },
  secondaryText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#0f172a',
  },
  preview: {
    marginTop: 8,
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
});
