import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Formik } from 'formik';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput, Button as PaperButton, IconButton, Card } from 'react-native-paper';
import { SocialIcon } from 'react-native-elements'


// useEffect(() => {
//   GoogleSignin.configure({
//     iosClientId: '151956588290-ja8v0v2lorl4d0b90kqmuqeoh1q86nfr.apps.googleusercontent.com'
//   });
// }, []);

const handleGoogleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const { idToken } = userInfo;

    // Sign in with Firebase using Google ID token
    const credential = GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(credential);
  } catch (error) {
    console.error('Google Sign-In Error', error);
  }
};

import {
  Button,
  FormErrorMessage,
} from '../components';
import { Colors, auth } from '../config';
import { useTogglePasswordVisibility } from '../hooks';
import { loginValidationSchema } from '../utils';

export const LoginScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState('');

const { passwordVisibility, handlePasswordVisibility, rightIcon } =
  useTogglePasswordVisibility();

const handleLogin = values => {
  const { email, password } = values;
    signInWithEmailAndPassword(auth, email, password).catch(error =>
    setErrorState(error.message)
  );
};

  return (
    <ImageBackground
      source={require('../assets/burgerUnsplash.png')}
      style={styles.backgroundImage}
    >
      <KeyboardAwareScrollView enableOnAndroid={true}>
          <Card style={styles.container}>
              <Text style={styles.title}>Hello again 😊</Text>
              <Formik
                initialValues={{
                  email: '',
                  password: '',
                }}
                validationSchema={loginValidationSchema}
                onSubmit={values => handleLogin(values)}
              >
                {({
                  values,
                  touched,
                  errors,
                  handleChange,
                  handleSubmit,
                  handleBlur,
                }) => (
                  <View style={{width:width * 0.9, alignSelf:'center'}}>
                    <TextInput
                      label="Email"
                      mode="outlined"
                      theme={{roundness:14}}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoFocus={true}
                      left={<TextInput.Icon icon="email-outline"/>}
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      style={styles.textInput}
    
                    />
                    <FormErrorMessage
                      error={errors.email}
                      visible={touched.email}
                      style={styles.errorText}
                    />
                    <TextInput
                      label="Password"
                      placeholder='Password'
                      mode="outlined"
                      theme={{
                        roundness:14,
                        colors: {
                          placeholder: 'white',
                          backgroundColor: "transparent"
                        },
                        
                      }}
                      autoCapitalize="none"
                      secureTextEntry
                      left={<TextInput.Icon icon="lock-outline"/>}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      style={styles.textInput}
                    />
                    <FormErrorMessage
                      error={errors.password}
                      visible={touched.password}
                      style={styles.errorText}
                    />
                    <TouchableOpacity
                      style={styles.touchableOpacityButton}
                      onPress={() => navigation.navigate('ForgotPassword')}
                    >
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                    {errorState !== '' ? (
                      <FormErrorMessage error={errorState} visible={true} />
                    ) : null}
                    <PaperButton style={styles.loginButton} onPress={handleSubmit}>
                      <Text style={styles.buttonText}>Sign in</Text>
                    </PaperButton>
                  </View>
                )}
              </Formik>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.touchableOpacityButton}
                  onPress={() => navigation.navigate('Signup')}
                >
                  <Text style={styles.createAccountText}>Don't have account?<Text style={{color:'#00CDBC', fontWeight:'800'}}> Signup</Text></Text>
                </TouchableOpacity>
                <Text style={{textAlign:'center', marginTop:40, marginBottom:20,}}> Or</Text> 
                <View style={styles.socialBtnContainer}>
                    

                <SocialIcon
                type='google'
                title='Sign In With Google'
                button
                light
                onPress={handleGoogleSignIn} // Call the Google Sign-In function
              />
                </View>
        </View>
      </Card>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode:'contain',
    height:280,
    backgroundColor:'#00CDBC'
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    width: width,
    height:height * 0.8,
    backgroundColor:'white',
    top: height * 0.3,
    borderRadius:20,
    paddingTop:40
  },
  buttonText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing:2,
  },
  createAccountText:{
    textAlign:'center',
    fontWeight:'500'
  },
  forgotPasswordText:{
    fontSize:12,
    textAlign:'right',
    fontWeight:'600',
    color:'#888'
  },
  touchableOpacityButton: {
    marginTop: 20,
  },
  loginButton:{
    backgroundColor:'#00CDBC',
    marginTop:40,
    padding:10
  },
  socialBtnContainer:{
    width:width * .7,
    alignSelf:'center',
  },
  socialBtn:{
    margin:20,
    border:'1px solid #999',
    borderColor:'#E8ECF4',
    width:80,
    borderWidth:1,
    borderRadius:5,
  },
  textInput:{
    width: width * 0.9,
    alignSelf:'center',
    backgroundColor:'#F7F8F9'
  },
  title:{
    marginBottom:20,
    fontSize:40,
    fontWeight:'500',
    marginLeft:20,
  },
});