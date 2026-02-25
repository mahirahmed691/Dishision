import React from 'react';
import { TextInput as RNTextInput } from 'react-native';

import { View } from './View';
import { Icon } from './Icon';
import { Button } from './Button';
import { ui } from "../config/designSystem";

export const TextInput = ({
  width = '100%',
  leftIconName,
  rightIcon,
  handlePasswordVisibility,
  ...otherProps
}) => {
  const { key: _key, ...textInputProps } = otherProps;
  return (
    <View
      style={{
        backgroundColor: ui.colors.white,
        borderRadius: 8,
        flexDirection: 'row',
        padding: 12,
        marginVertical: 12,
        width,
        borderWidth: 1,
        borderColor: ui.colors.textMuted,
      }}
    >
      {leftIconName ? (
        <Icon
          name={leftIconName}
          size={22}
          color={ui.colors.textMuted}
          style={{ marginRight: 10 }}
        />
      ) : null}
      <RNTextInput
        style={{
          flex: 1,
          width: '100%',
          fontSize: 18,
          color: ui.colors.black
        }}
        placeholderTextColor={ui.colors.textMuted}
        {...textInputProps}
      />
      {rightIcon ? (
        <Button onPress={handlePasswordVisibility}>
          <Icon
            name={rightIcon}
            size={22}
            color={ui.colors.textMuted}
            style={{ marginRight: 10 }}
          />
        </Button>
      ) : null}
    </View>
  );
};
