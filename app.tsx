import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Purchases from '@revenuecat/purchases-react-native';

const Stack = createNativeStackNavigator();

// Setup RevenueCat (replace with your keys later)
Purchases.setDebugLogsEnabled(true);
if (Platform.OS === 'ios') {
  Purchases.configure({ apiKey: 'appl_yourkey' });
} else {
  Purchases.configure({ apiKey: 'goog_yourkey' });
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkPremium();
  }, []);

  const checkPremium = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const premium = customerInfo.entitlements.active['pro'] !== undefined;
      setIsPremium(premium);
      if (premium) navigation.replace('Lobby');
    } catch (e) {
      setIsPremium(false);
    }
  };

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a3a']} style={styles.container}>
      <Text style={styles.title}>Teammate AI</Text>
      <Text style={styles.subtitle}>Your always-online gaming partner</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => (isPremium ? navigation.navigate('Lobby') : navigation.navigate('Paywall'))}
      >
        <Text style={styles.buttonText}>Find My Teammate</Text>
      </TouchableOpacity>
      <Text style={styles.small}>Free on mobile • Upgrade for console/PC</Text>
    </LinearGradient>
  );
}

function PaywallScreen({ navigation }) {
  const buyPro = async (pkg) => {
    try {
      const offerings = await Purchases.getOfferings();
      const package = offerings.current?.availablePackages.find(p => p.identifier === pkg);
      if (package) {
        const { customerInfo } = await Purchases.purchasePackage(package);
        if (customerInfo.entitlements.active['pro']) {
          navigation.replace('Lobby');
        }
      }
    } catch (e) {
      Alert.alert('Purchase failed', 'Check your connection');
    }
  };

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a3a']} style={styles.container}>
      <Text style={styles.paywallTitle}>Unlock Full Power</Text>
      <Text style={styles.paywallSub}>Console, PC, Unlimited Play</Text>
      <TouchableOpacity style={styles.card} onPress={() => buyPro('monthly')}>
        <Text style={styles.plan}>Monthly Pro</Text>
        <Text style={styles.price}>$19.99/mo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.card, styles.best]} onPress={() => buyPro('yearly')}>
        <Text style={styles.bestBadge}>BEST</Text>
        <Text style={styles.plan}>Yearly Pro</Text>
        <Text style={styles.price}>$179/yr (Save 25%)</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.later}>Use Free Version</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

function LobbyScreen() {
  const [status, setStatus] = useState('Spawning your AI teammate...');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('✅ Ready! Open your game — AI is in your friends list & guild.');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a3a']} style={styles.container}>
      <Text style={styles.h1}>Teammate Activated!</Text>
      <Text style={styles.status}>{status}</Text>
      <TouchableOpacity style={styles.playButton} onPress={() => Alert.alert('Let\'s Play!', 'Your AI is live in-game. Add it now!')}>
        <Text style={styles.buttonText}>Launch Game</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 42, fontWeight: '900', color: '#fff', marginBottom: 10, letterSpacing: 1 },
  subtitle: { fontSize: 18, color: '#aaa', marginBottom: 40, textAlign: 'center' },
  button: { backgroundColor: '#6c5ce7', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 30, marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  small: { color: '#666', fontSize: 14, textAlign: 'center' },
  paywallTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  paywallSub: { fontSize: 16, color: '#aaa', marginBottom: 30, textAlign: 'center' },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 15, marginBottom: 15, width: '100%', alignItems: 'center' },
  best: { borderColor: '#ffd700', borderWidth: 1 },
  bestBadge: { position: 'absolute', top: -5, backgroundColor: '#ffd700', color: '#000', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 12, fontWeight: 'bold' },
  plan: { fontSize: 18, color: '#fff', marginBottom: 5 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#6c5ce7' },
  later: { color: '#aaa', marginTop: 20, fontSize: 16 },
  h1: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  status: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  playButton: { backgroundColor: '#00ff88', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 30 },
});
