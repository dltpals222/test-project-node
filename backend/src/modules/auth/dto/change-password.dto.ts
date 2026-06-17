import { IsString, Matches, MinLength } from 'class-validator';
import { IsEqualTo } from '../../../common/decorators/is-equal-to.decorator';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../../common/utils/password.utils';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: PASSWORD_POLICY_MESSAGE })
  @Matches(PASSWORD_POLICY_REGEX, { message: PASSWORD_POLICY_MESSAGE })
  newPassword: string;

  @IsString()
  @IsEqualTo('newPassword', { message: '새 비밀번호와 확인이 일치하지 않습니다' })
  confirmPassword: string;
}
