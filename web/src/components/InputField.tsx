import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type BaseInputFieldProps = {
  name: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

type TextareaProps = BaseInputFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { textarea: true };

type InputProps = BaseInputFieldProps &
  InputHTMLAttributes<HTMLInputElement> & { textarea?: false };

// Define a union of the props based on whether `textarea` is true or false
type InputFieldProps = TextareaProps | InputProps;

const InputField: React.FC<InputFieldProps> = ({
  label,
  textarea = false,
  size: _, // `size` is destructured but not passed down
  ...props
}) => {
  const [field, meta] = useField(props.name); // useField only needs the name here
  const InputOrTextarea = textarea ? Textarea : Input;

  return (
    <FormControl isInvalid={!!meta.error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputOrTextarea {...field} {...(props as any)} id={field.name} />
      {meta.error ? <FormErrorMessage>{meta.error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;
