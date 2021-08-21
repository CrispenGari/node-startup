import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import { User } from "../entity/User";

@ValidatorConstraint({ async: true })
export class IsEmailTakenConstraint implements ValidatorConstraintInterface {
  validate(email: any, _args: ValidationArguments) {
    return User.findOne({ where: { email } }).then((user: any) => {
      if (user) return false;
      return true;
    });
  }
}
export function IsEmailTaken(validationOptions?: ValidationOptions) {
  return function (object: Object, _propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: "email",
      options: validationOptions,
      constraints: [],
      validator: IsEmailTakenConstraint,
    });
  };
}
