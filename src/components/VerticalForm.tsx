import React from "react";
import { FieldValues, Resolver, useForm } from "react-hook-form";

interface VerticalFormProps<TFormValues extends FieldValues> {
  defaultValues?: any;
  resolver?: Resolver<TFormValues>;
  children?: any;
  onSubmit: any;
  formClass?: string;
}

const VerticalForm = <
  TFormValues extends Record<string, any> = Record<string, any>
>({
  defaultValues,
  resolver,
  children,
  onSubmit,
  formClass,
}: VerticalFormProps<TFormValues>) => {
  /*
   * form methods
   */
  const methods = useForm<TFormValues>({ defaultValues, resolver });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
  } = methods;

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, { reset }))}
      className={formClass}
      noValidate
    >
      {Array.isArray(children)
        ? children.map((child) => {
            return child.props && child.props.name
              ? React.createElement(child.type, {
                  ...{
                    ...child.props,
                    register,
                    key: child.props.name,
                    errors,
                    control,
                  },
                })
              : child;
          })
        : children}
    </form>
  );
};

export default VerticalForm;
