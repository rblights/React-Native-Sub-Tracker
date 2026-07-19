import { useSignUp } from '@clerk/expo';
import clsx from 'clsx';
import { usePostHog } from 'posthog-react-native';
import { Link, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const posthog = usePostHog();

  const [name, setName] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [localEmailError, setLocalEmailError] = React.useState('');
  const [localPasswordError, setLocalPasswordError] = React.useState('');
  const [codeError, setCodeError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const busy = submitting || fetchStatus === 'fetching';

  // Verification phase once the email needs confirming.
  const verifying = signUp.status === 'missing_requirements'
    && signUp.unverifiedFields.includes('email_address');

  const emailFieldError = localEmailError || (errors.fields.emailAddress?.message ?? '');
  const passwordFieldError = localPasswordError || (errors.fields.password?.message ?? '');
  const generalError = errors.global?.[0]?.message ?? '';

  const canSubmitDetails =
    emailAddress.length > 0 && password.length > 0 && !busy;

  const finalizeNavigate = ({ session }: { session: { currentTask?: unknown } | null }) => {
    if (session?.currentTask) return;
    router.replace('/');
  };

  const handleCreate = async () => {
    setLocalEmailError('');
    setLocalPasswordError('');

    if (!EMAIL_REGEX.test(emailAddress)) {
      setLocalEmailError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setLocalPasswordError('Use at least 8 characters.');
      return;
    }

    const trimmedName = name.trim();
    const [firstName, ...rest] = trimmedName.split(/\s+/).filter(Boolean);
    const lastName = rest.join(' ');

    setSubmitting(true);
    try {
      const { error } = await signUp.password({
        emailAddress,
        password,
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
      });
      if (error) return;

      await signUp.verifications.sendEmailCode();
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    setCodeError('');
    if (code.trim().length === 0) {
      setCodeError('Enter the code we emailed you.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
      if (error) {
        setCodeError('That code isn’t right. Please check and try again.');
        return;
      }
      if (signUp.status === 'complete') {
        posthog.capture('user_signed_up');
        await signUp.finalize({ navigate: finalizeNavigate });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setCodeError('');
    setSubmitting(true);
    try {
      await signUp.verifications.sendEmailCode();
    } finally {
      setSubmitting(false);
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
            <Text className="auth-title">{verifying ? 'Verify your email' : 'Create your account'}</Text>
            <Text className="auth-subtitle">
              {verifying
                ? `We sent a 6-digit code to ${emailAddress}. Enter it below to finish setting up.`
                : 'Start tracking every subscription in one calm, organized place.'}
            </Text>
          </View>

          <View className="auth-card">
            {verifying ? (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={clsx('auth-input', codeError && 'auth-input-error')}
                    value={code}
                    onChangeText={(value) => {
                      setCode(value);
                      if (codeError) setCodeError('');
                    }}
                    placeholder="123456"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    editable={!busy}
                  />
                  {codeError ? <Text className="auth-error">{codeError}</Text> : null}
                </View>

                {generalError ? <Text className="auth-error">{generalError}</Text> : null}

                <Pressable
                  className={clsx('auth-button', busy && 'auth-button-disabled')}
                  onPress={handleVerify}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Verify & continue</Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={handleResend}
                  disabled={busy}
                >
                  <Text className="auth-secondary-button-text">Resend code</Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Name</Text>
                  <TextInput
                    className="auth-input"
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="name"
                    editable={!busy}
                  />
                  <Text className="auth-helper">Optional — helps personalize your dashboard.</Text>
                </View>

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
                    onChangeText={(value) => {
                      setPassword(value);
                      if (localPasswordError) setLocalPasswordError('');
                    }}
                    placeholder="At least 8 characters"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    secureTextEntry
                    autoCapitalize="none"
                    textContentType="newPassword"
                    editable={!busy}
                  />
                  {passwordFieldError ? (
                    <Text className="auth-error">{passwordFieldError}</Text>
                  ) : null}
                </View>

                {generalError ? <Text className="auth-error">{generalError}</Text> : null}

                <Pressable
                  className={clsx('auth-button', !canSubmitDetails && 'auth-button-disabled')}
                  onPress={handleCreate}
                  disabled={!canSubmitDetails}
                >
                  {busy ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </Pressable>

                {/* Bot-protection anchor — required by the sign-up flow. */}
                <View nativeID="clerk-captcha" />
              </View>
            )}
          </View>

          {!verifying ? (
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable hitSlop={8}>
                  <Text className="auth-link">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
