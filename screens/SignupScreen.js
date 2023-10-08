import React, { useState } from 'react';
import { Text, StyleSheet, Image, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import {Card, IconButton} from 'react-native-paper'
import { Formik } from 'formik';
import { OAuthButtons } from "../components/oAuth";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import defaultAvatar from '../assets/avatar.png'; 

import {
  View,
  Button,
  FormErrorMessage,
} from '../components';
import { Colors, auth, db } from '../config';
import { useTogglePasswordVisibility } from '../hooks';
import * as Yup from 'yup';

export const SignupScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState('');
  const [profileImage, setProfileImage] = useState(defaultAvatar);

  const {
    passwordVisibility,
    handlePasswordVisibility,
    rightIcon,
    handleConfirmPasswordVisibility,
    confirmPasswordIcon,
    confirmPasswordVisibility,
  } = useTogglePasswordVisibility();

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }
  
    const pickerResult = await ImagePicker.launchImageLibraryAsync();
  
    if (pickerResult.cancelled === true) {
      // User cancelled image selection, set the default profile image
      setProfileImage(setProfileImage);
    } else {
      // User selected an image, set it as the profile picture
      setProfileImage({ uri: pickerResult.uri });
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithCredential(auth, provider);
  
      // If Google Sign-In is successful, you can handle the user data here
      // For example, you can access user.displayName, user.email, and user.photoURL
  
      // Redirect or navigate to the desired screen
      navigation.navigate('Profile'); // Replace with your desired destination screen
    } catch (error) {
      setErrorState(error.message);
    }
  };
  
  

  const handleSignup = async values => {
    const { email, password, username } = values;
  
    // Check if the profile image is the default avatar
    const isDefaultAvatar = profileImage === defaultAvatar;
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Set the displayName here
      await updateProfile(user, {
        displayName: `${username}`,
        photoURL: isDefaultAvatar ? null : profileImage.uri, // Set photoURL to null if it's the default avatar
      });
  
      if (!isDefaultAvatar) {
        // Upload the profile image if it's not the default avatar
        const storageRef = storage.ref(`profile_images/${user.uid}`);
        const snapshot = await storageRef.putFile(profileImage.uri);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        // Update the photoURL with the download URL
        await updateProfile(user, {
          photoURL: downloadURL,
        });
      }
  
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        displayName: `${username}`,
        // Add other user data as needed
      });
  
      navigation.navigate('Profile'); // Replace with your desired destination screen
    } catch (error) {
      setErrorState(error.message);
    }
  };
  


  return (
      <>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
      >
        <Card style={styles.container} isSafe>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconButton style={{border:"solid", borderWidth:2, marginLeft:25, borderRadius:10}} icon="keyboard-backspace" />
        </TouchableOpacity>
          <Text style={styles.screenTitle}>Sign up now to get rolling</Text>
          <TouchableOpacity onPress={handleImagePicker} style={styles.profileImagePicker}>
            <Image source={profileImage} style={styles.profileImage} />
          </TouchableOpacity>
          <View style={{width: width * 0.8, alignSelf:'center'}}>
          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={signupValidationSchema}
            onSubmit={values => handleSignup(values)}
          >
            {({
              values,
              touched,
              errors,
              handleChange,
              handleSubmit,
              handleBlur,
            }) => (
              <>
                <TextInput
                  label="Username"
                  mode="outlined"
                  autoCapitalize="words"
                  value={values.firstName}
                  theme={{
                    roundness:14,
                    colors: {
                      placeholder: 'white',
                      backgroundColor: "transparent"
                    },
                    
                  }}
                  onChangeText={handleChange('username')}
                  left={<TextInput.Icon icon="account-outline"/>}
                  onBlur={handleBlur('firstName')}
                  style={styles.textInput}
                />
                <FormErrorMessage error={errors.firstName} visible={touched.firstName} />
                <FormErrorMessage error={errors.lastName} visible={touched.lastName} />
                
                <TextInput
                  label="Email"
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  theme={{
                    roundness:14,
                    colors: {
                      placeholder: 'white',
                      backgroundColor: "transparent"
                    },
                    
                  }}
                  left={<TextInput.Icon icon="email-outline"/>}
                  textContentType="emailAddress"
                  autoFocus={true}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  style={styles.textInput}
                />
                <FormErrorMessage error={errors.email} visible={touched.email} />
                
                <TextInput
                  label="Password"
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  theme={{
                    roundness:14,
                    colors: {
                      placeholder: 'white',
                      backgroundColor: "transparent"
                    },
                    
                  }}
                  secureTextEntry={passwordVisibility}
                  textContentType="newPassword"
                  left={<TextInput.Icon icon="lock-outline"/>}
                  right={<TextInput.Icon icon="eye" onPress={handlePasswordVisibility} />}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  style={styles.textInput}
                />
                <FormErrorMessage
                  error={errors.password}
                  visible={touched.password}
                />
                
                <TextInput
                  label="Confirm Password"
                  mode="outlined"
                  autoCapitalize="none"
                  theme={{
                    roundness:14,
                    colors: {
                      placeholder: 'white',
                      backgroundColor: "transparent"
                    },
                    
                  }}
                  autoCorrect={false}
                  secureTextEntry={confirmPasswordVisibility}
                  textContentType="password"
                  left={<TextInput.Icon icon="lock-outline"/>}
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  style={styles.textInput}
                />
                <FormErrorMessage
                  error={errors.confirmPassword}
                  visible={touched.confirmPassword}
                />
                
                {errorState !== '' ? (
                  <FormErrorMessage error={errorState} visible={true} />
                ) : null}
                <Button style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Signup</Text>
                </Button>
                <TouchableOpacity
                  style={styles.touchableOpacityButton}
                  onPress={() => navigation.navigate('Login')}
                >

                <Text style={{marginTop:20, textAlign:'center'}}>Already have an account? <Text style={{color:"#60BA62", fontWeight:'800'}}>Login</Text></Text>
                </TouchableOpacity>
                
                <View>
                <View style={styles.buttonContainer}>
                <Text style={{textAlign:'center', marginTop:40}}> Or Login With</Text> 
                <View style={styles.socialBtnContainer}>
                <IconButton
                    style={styles.socialBtn}
                    icon="google"
                    iconColor='red'
                    backgroundColor={Colors.white}
                    size={30}
                    onPress={() => console.log('Pressed')}
                />
                <IconButton
                    style={styles.socialBtn}
                    icon="twitter"
                    iconColor={Colors.blue}
                    backgroundColor={Colors.white}
                    size={30}
                    onPress={() => console.log('Pressed')}
                />
                <IconButton
                    style={styles.socialBtn}
                    icon="apple"
                    iconColor='black'
                    animated={true}
                    mode="contained-tonal"
                    backgroundColor={Colors.white}
                    size={30}
                    onPress={() => console.log('Pressed')}
                />
              </View>
            </View>
                </View>
              </>
            )}
          </Formik>
          
          </View>
        </Card>
      </KeyboardAwareScrollView>
      </>
    
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    backgroundColor:"#FFF"
  },
  container: {
    flex: 1,
    paddingTop:120,
    width:width,
    height: height,
    backgroundColor:"#FFF"
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
    paddingTop: 20,
    textAlign:'left',
    marginLeft:25,
    position: 'absolute',
    top:-80,
  },
  button: {
    width: width * 0.9,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 8,
    backgroundColor: "#60BA62",
    padding: 15,
    borderRadius: 8
  },
  buttonText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '900',
    textAlign:'center'
  },
  profileImagePicker: {
    alignItems: 'center',
    marginBottom: 16,
    width:100,
    height:100,
    borderRadius:50,
    backgroundColor:'red',
    alignSelf:'center'
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImageText: {
    fontSize: 18,
    color: Colors.black,
  },
  touchableOpacityButton:{
    marginTop:40,
  },
  textInput:{
    width: width * 0.9,
    alignSelf:'center'
  },
  socialBtn:{
    margin:20,
    border:'1px solid #999',
    borderColor:'#E8ECF4',
    width:80,
    borderWidth:1,
    borderRadius:5,
  },
  socialBtnContainer:{
    flexDirection:'row',
    justifyContent:'center'
  },
});

const signupValidationSchema = Yup.object().shape({
  username: Yup.string()
    .required('username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});
