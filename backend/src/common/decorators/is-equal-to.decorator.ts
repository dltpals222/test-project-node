import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * 같은 DTO 내 다른 속성과 값이 일치하는지 검증한다.
 * 예: 비밀번호 확인 필드
 *   @IsEqualTo('newPassword', { message: '새 비밀번호와 확인이 일치하지 않습니다' })
 *   confirmPassword: string;
 */
export function IsEqualTo(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isEqualTo',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} 값이 ${relatedPropertyName} 와 일치하지 않습니다`;
        },
      },
    });
  };
}
