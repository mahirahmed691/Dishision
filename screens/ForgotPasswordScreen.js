import React, { useState } from 'react';
import { StyleSheet, View, ImageBackground, Text } from 'react-native';
import { Formik } from 'formik';
import { sendPasswordResetEmail } from 'firebase/auth';
import { TextInput as PaperTextInput, Button as PaperButton, IconButton } from 'react-native-paper';

import { passwordResetSchema } from '../utils';
import { Colors, auth } from '../config';
import { FormErrorMessage } from '../components';
import { TouchableOpacity } from 'react-native-gesture-handler';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState('');

  const handleSendPasswordResetEmail = values => {
    const { email } = values;

    sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log('Success: Password Reset Email sent.');
        navigation.navigate('Login');
      })
      .catch(error => setErrorState(error.message));
  };

  return (
    <ImageBackground
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Formik
          initialValues={{ email: '' }}
          validationSchema={passwordResetSchema}
          onSubmit={values => handleSendPasswordResetEmail(values)}
        >
          {({
            values,
            touched,
            errors,
            handleChange,
            handleSubmit,
            handleBlur
          }) => (
            <>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <IconButton style={{border:"solid", borderWidth:2, marginBottom:30, borderRadius:10}} icon="keyboard-backspace" />
            </TouchableOpacity>
              <Text style={{fontSize:20, fontWeight:'600'}}>Forgot Password? 😰</Text>
              <Text style={{marginBottom:20}}>Be at ease! Type the email address associated with your account here.</Text>
              <PaperTextInput
                label="Email"
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                style={styles.input}
              />
              <FormErrorMessage error={errors.email} visible={touched.email} />
              {errorState !== '' ? (
                <FormErrorMessage error={errorState} visible={true} />
              ) : null}
              <PaperButton
                style={styles.button}
                mode="contained"
                onPress={handleSubmit}
                labelStyle={{ fontWeight: 'bold' }} 
              >
                Send Reset Email
              </PaperButton>
            </>
          )}
        </Formik>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={{ fontWeight: 900, color: 'white', fontSize: 20, textAlign:'center', marginTop:20,  }}>
            Go back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    resizeMode:'cover',
    backgroundColor:"#fff",
    paddingTop:150,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', 
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: '#60BA62',
    padding:15,
  },
 
});

export default ForgotPasswordScreen;
