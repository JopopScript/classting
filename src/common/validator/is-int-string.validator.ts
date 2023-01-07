import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsIntString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsIntString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return (typeof value === 'string') && (/^[+-]?[0-9]+$/.test(value))
        }
      }
    });
  };
}