import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

// ─── Reusable input ───────────────────────────────────────────────────────────

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address';
  inputBg: string;
  border: string;
  textColor: string;
};

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  secure,
  keyboardType = 'default',
  inputBg,
  border,
  textColor,
}: InputFieldProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={field.wrap}>
      <ThemedText style={field.label}>{label}</ThemedText>
      <View style={[field.row, { backgroundColor: inputBg, borderColor: border }]}>
        <TextInput
          style={[field.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={textColor + '55'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !revealed}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {secure && (
          <Pressable onPress={() => setRevealed((r) => !r)} style={field.eye} hitSlop={8}>
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={textColor + '77'}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const field = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', opacity: 0.72, marginBottom: 7 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 15,
    height: 52,
  },
  input: { flex: 1, fontSize: 15 },
  eye: { paddingLeft: 8 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tint = Colors[colorScheme].tint;
  const card = Colors[colorScheme].card;
  const text = Colors[colorScheme].text;
  const border = Colors[colorScheme].border;
  const inputBg = colorScheme === 'light' ? '#F0ECFF' : '#1E1535';

  useEffect(() => {
    if (!loading && session) {
      router.replace('/(tabs)');
    }
  }, [loading, session]);

  const isSignUp = mode === 'signup';

  async function handleSubmit() {
    setError(null);

    if (isSignUp && password !== confirmPwd) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        // Email confirmation is disabled in dev — session fires immediately.
        // If enabled, data.session will be null and user sees the message below.
        if (data.user && !data.session) {
          setError('Check your email to confirm your account, then sign in.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // AuthGuard in _layout.tsx watches onAuthStateChange and navigates to tabs.
      }
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: tint }]}>
      <StatusBar style="light" />

      {/* ── Branding header ── */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="wallet" size={38} color={tint} />
        </View>
        <ThemedText lightColor="#fff" darkColor="#fff" style={styles.appName}>
          Expense Tracker
        </ThemedText>
        <ThemedText
          lightColor="rgba(255,255,255,0.68)"
          darkColor="rgba(255,255,255,0.68)"
          style={styles.tagline}>
          Smart money, smarter life
        </ThemedText>
      </View>

      {/* ── Form sheet ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <ScrollView
          style={[styles.sheet, { backgroundColor: card }]}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Sign In / Sign Up toggle */}
          <View style={[styles.modeBar, { backgroundColor: inputBg }]}>
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <Pressable
                key={m}
                style={[styles.modeBtn, mode === m && { backgroundColor: tint }]}
                onPress={() => setMode(m)}>
                <ThemedText
                  lightColor={mode === m ? '#fff' : undefined}
                  darkColor={mode === m ? '#fff' : undefined}
                  style={[styles.modeBtnText, mode === m && { fontWeight: '700' }]}>
                  {m === 'signin' ? 'Sign In' : 'Sign Up'}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {/* Title */}
          <ThemedText type="subtitle" style={styles.formTitle}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </ThemedText>
          <ThemedText style={styles.formSubtitle}>
            {isSignUp
              ? 'Fill in your details to get started'
              : 'Sign in to continue to your dashboard'}
          </ThemedText>

          {/* Fields */}
          {isSignUp && (
            <InputField
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              inputBg={inputBg}
              border={border}
              textColor={text}
            />
          )}

          <InputField
            label="Email Address"
            placeholder="johndoe@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            inputBg={inputBg}
            border={border}
            textColor={text}
          />

          <InputField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secure
            inputBg={inputBg}
            border={border}
            textColor={text}
          />

          {isSignUp && (
            <InputField
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              secure
              inputBg={inputBg}
              border={border}
              textColor={text}
            />
          )}

          {!isSignUp && (
            <Pressable style={styles.forgotRow}>
              <ThemedText lightColor={tint} darkColor={tint} style={styles.forgotText}>
                Forgot Password?
              </ThemedText>
            </Pressable>
          )}

          {/* Error message */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
              <ThemedText lightColor="#EF4444" darkColor="#EF4444" style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          )}

          {/* Primary button */}
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: tint, opacity: submitting || pressed ? 0.84 : 1 },
            ]}
            onPress={handleSubmit}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText lightColor="#fff" darkColor="#fff" style={styles.submitText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </ThemedText>
            )}
          </Pressable>

          {/* Social divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: border }]} />
            <ThemedText style={styles.dividerLabel}>or continue with</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: border }]} />
          </View>

          {/* Google */}
          <Pressable
            style={({ pressed }) => [
              styles.socialBtn,
              { backgroundColor: inputBg, borderColor: border, opacity: pressed ? 0.7 : 1 },
            ]}>
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <ThemedText style={styles.socialText}>Continue with Google</ThemedText>
          </Pressable>

          {/* Footer toggle */}
          <View style={styles.footerRow}>
            <ThemedText style={styles.footerText}>
              {isSignUp ? 'Already have an account?  ' : "Don't have an account?  "}
            </ThemedText>
            <Pressable onPress={() => setMode(isSignUp ? 'signin' : 'signup')}>
              <ThemedText lightColor={tint} darkColor={tint} style={styles.footerLink}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 72 : 54,
    paddingBottom: 38,
    gap: 8,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.24)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  appName: { fontSize: 26, fontWeight: '800', letterSpacing: 0.2 },
  tagline: { fontSize: 14 },

  sheet: {
    flex: 1,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  sheetContent: {
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 44,
  },

  modeBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  modeBtnText: { fontSize: 14 },

  formTitle: { fontSize: 22, marginBottom: 6 },
  formSubtitle: { fontSize: 13, opacity: 0.52, marginBottom: 24, lineHeight: 20 },

  forgotRow: { alignSelf: 'flex-end', marginTop: -6, marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: '600' },

  submitBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  submitText: { fontSize: 16, fontWeight: '700' },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerLabel: { fontSize: 12, opacity: 0.48 },

  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    marginBottom: 30,
  },
  socialText: { fontSize: 15, fontWeight: '500' },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 14, opacity: 0.58 },
  footerLink: { fontSize: 14, fontWeight: '700' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 13, lineHeight: 18 },
});