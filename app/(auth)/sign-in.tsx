import { useSignIn } from '@clerk/expo';
import clsx from 'clsx';
import { Link, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [localEmailError, setLocalEmailError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Forgot-password reset flow
  const [resetOpen, setResetOpen] = React.useState(false);
  const [resetStep, setResetStep] = React.useState<'request' | 'reset'>('request');
  const [resetCode, setResetCode] = React.useState('');
  const [resetPassword, setResetPassword] = React.useState('');
  const [resetError, setResetError] = React.useState('');
  const [resetBusy, setResetBusy] = React.useState(false);
  const [resetSentTo, setResetSentTo] = React.useState('');

  const busy = submitting || fetchStatus === 'fetching';
  const canSubmit = emailAddress.length > 0 && password.length > 0 && !busy;

  const emailFieldError = localEmailError || (errors.fields.identifier?.message ?? '');
  const passwordFieldError = errors.fields.password?.message ?? '';
  const generalError = errors.global?.[0]?.message ?? '';

  const finalizeNavigate = ({ session }: { session: { currentTask?: unknown } | null }) => {
    if (session?.currentTask) return;
    router.replace('/');
  };

  const handleSubmit = async () => {
    setLocalEmailError('');
    if (!EMAIL_REGEX.test(emailAddress)) {
      setLocalEmailError('Enter a valid email address.');
      return;
    }
    if (!password) return;

    setSubmitting(true);
    try {
      const { error } = await signIn.password({ emailAddress, password });
      if (error) return;

      if (signIn.status === 'complete') {
        await signIn.finalize({ navigate: finalizeNavigate });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openReset = () => {
    setResetError('');
    setResetCode('');
    setResetPassword('');
    setResetStep('request');
    setResetOpen(true);
  };

  const closeReset = () => {
    setResetOpen(false);
  };

  const handleResetRequest = async () => {
    setResetError('');
    if (!EMAIL_REGEX.test(emailAddress)) {
      setResetError('Enter your account email on the previous screen first.');
      return;
    }
    setResetBusy(true);
    try {
      const created = await signIn.create({ identifier: emailAddress });
      if (created.error) {
        setResetError('We couldn’t find an account with that email.');
        return;
      }
      const sent = await signIn.resetPasswordEmailCode.sendCode();
      if (sent.error) {
        setResetError('Something went wrong sending your code. Please try again.');
        return;
      }
      setResetSentTo(emailAddress);
      setResetStep('reset');
    } finally {
      setResetBusy(false);
    }
  };

  const handleResetSubmit = async () => {
    setResetError('');
    if (resetCode.trim().length === 0) {
      setResetError('Enter the code we emailed you.');
      return;
    }
    if (resetPassword.length < 8) {
      setResetError('Your new password must be at least 8 characters.');
      return;
    }
    setResetBusy(true);
    try {
      const verified = await signIn.resetPasswordEmailCode.verifyCode({ code: resetCode.trim() });
      if (verified.error) {
        setResetError('That code isn’t right. Please check and try again.');
        return;
      }
      const submitted = await signIn.resetPasswordEmailCode.submitPassword({
        password: resetPassword,
      });
      if (submitted.error) {
        setResetError('We couldn’t set that password. Please try another.');
        return;
      }
      if (signIn.status === 'complete') {
        setResetOpen(false);
        await signIn.finalize({ navigate: finalizeNavigate });
      }
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">S</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Sub Tracker</Text>
                <Text className="auth-wordmark-sub">Subscription manager</Text>
              </View>
            </View>
            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to keep every subscription and renewal in check.
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={clsx('auth-input', emailFieldError && 'auth-input-error')}
                  value={emailAddress}
                  onChangeText={(value) => {
                    setEmailAddress(value);
                    if (localEmailError) setLocalEmailError('');
                  }}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!busy}
                />
                {emailFieldError ? <Text className="auth-error">{emailFieldError}</Text> : null}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className={clsx('auth-input', passwordFieldError && 'auth-input-error')}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="password"
                  editable={!busy}
                />
                {passwordFieldError ? (
                  <Text className="auth-error">{passwordFieldError}</Text>
                ) : null}
                <Pressable onPress={openReset} hitSlop={8}>
                  <Text className="auth-link">Forgot password?</Text>
                </Pressable>
              </View>

              {generalError ? <Text className="auth-error">{generalError}</Text> : null}

              <Pressable
                className={clsx('auth-button', !canSubmit && 'auth-button-disabled')}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                {busy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Continue</Text>
                )}
              </Pressable>
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">New here?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable hitSlop={8}>
                <Text className="auth-link">Create an account</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={resetOpen} transparent animationType="slide" onRequestClose={closeReset}>
        <View className="modal-overlay">
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">
                {resetStep === 'request' ? 'Reset password' : 'Enter your code'}
              </Text>
              <Pressable className="modal-close" onPress={closeReset} hitSlop={8}>
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <View className="modal-body">
              {resetStep === 'request' ? (
                <>
                  <Text className="auth-helper">
                    We’ll email a reset code to{' '}
                    <Text className="auth-label">{emailAddress || 'your account'}</Text>.
                  </Text>
                  {resetError ? <Text className="auth-error">{resetError}</Text> : null}
                  <Pressable
                    className={clsx('auth-button', resetBusy && 'auth-button-disabled')}
                    onPress={handleResetRequest}
                    disabled={resetBusy}
                  >
                    {resetBusy ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Send reset code</Text>
                    )}
                  </Pressable>
                </>
              ) : (
                <>
                  <Text className="auth-helper">
                    We sent a code to <Text className="auth-label">{resetSentTo}</Text>. Enter it
                    below and choose a new password.
                  </Text>
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className="auth-input"
                      value={resetCode}
                      onChangeText={setResetCode}
                      placeholder="123456"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      keyboardType="number-pad"
                      editable={!resetBusy}
                    />
                  </View>
                  <View className="auth-field">
                    <Text className="auth-label">New password</Text>
                    <TextInput
                      className="auth-input"
                      value={resetPassword}
                      onChangeText={setResetPassword}
                      placeholder="At least 8 characters"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      secureTextEntry
                      autoCapitalize="none"
                      editable={!resetBusy}
                    />
                  </View>
                  {resetError ? <Text className="auth-error">{resetError}</Text> : null}
                  <Pressable
                    className={clsx('auth-button', resetBusy && 'auth-button-disabled')}
                    onPress={handleResetSubmit}
                    disabled={resetBusy}
                  >
                    {resetBusy ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Update password</Text>
                    )}
                  </Pressable>
                  <Pressable
                    className="auth-secondary-button"
                    onPress={handleResetRequest}
                    disabled={resetBusy}
                  >
                    <Text className="auth-secondary-button-text">Resend code</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignIn;
