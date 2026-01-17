import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function UserScreen() {
  const { user, profile, signOut } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTodaysAvailability();
  }, []);

  const loadTodaysAvailability = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('availability')
        .select('is_available')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsAvailable(data?.is_available || false);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (available) => {
    setUpdating(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('availability')
        .upsert({
          user_id: user.id,
          date: today,
          is_available: available,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      setIsAvailable(available);
      Alert.alert(
        'Success',
        available
          ? 'You are now available for laundry pickup today!'
          : 'Availability updated'
      );
    } catch (error) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', 'Failed to update availability');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>{profile?.email}</Text>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            Building: {profile?.building}
          </Text>
          <Text style={styles.locationText}>
            Flat: {profile?.flat_no}
          </Text>
        </View>
      </View>

      <View style={styles.availabilityContainer}>
        <Text style={styles.sectionTitle}>Today's Availability</Text>
        <Text style={styles.question}>
          Are you available for laundry pickup today?
        </Text>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              isAvailable ? styles.statusAvailable : styles.statusUnavailable,
            ]}
          />
          <Text style={styles.statusText}>
            {isAvailable ? 'Available' : 'Not Available'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isAvailable ? styles.buttonUnavailable : styles.buttonAvailable,
            updating && styles.buttonDisabled,
          ]}
          onPress={() => updateAvailability(!isAvailable)}
          disabled={updating}
        >
          <Text style={styles.buttonText}>
            {updating
              ? 'Updating...'
              : isAvailable
              ? 'Mark as Unavailable'
              : 'Mark as Available'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Note: Your availability resets every day at midnight.
        </Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  locationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  availabilityContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  question: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  statusAvailable: {
    backgroundColor: '#34C759',
  },
  statusUnavailable: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonAvailable: {
    backgroundColor: '#34C759',
  },
  buttonUnavailable: {
    backgroundColor: '#FF9500',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  signOutButton: {
    marginTop: 'auto',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  signOutText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
