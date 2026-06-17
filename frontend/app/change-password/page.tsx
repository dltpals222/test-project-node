'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { z } from 'zod';
import { useChangePassword, useSession } from '@/features/auth/hooks';
import { roleHome } from '@/lib/auth';

const PASSWORD_POLICY =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/;

const schema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력하세요'),
    newPassword: z
      .string()
      .min(8, '비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다')
      .regex(PASSWORD_POLICY, '비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다'),
    confirmPassword: z.string().min(1, '새 비밀번호 확인을 입력하세요'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: '새 비밀번호와 확인이 일치하지 않습니다',
  });
type FormValues = z.infer<typeof schema>;

function errorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string | string[] } } };
  const msg = e.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg ?? '비밀번호 변경에 실패했습니다';
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useSession();
  const changePassword = useChangePassword();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    changePassword.mutate(values, {
      onSuccess: () => {
        setDone(true);
        setTimeout(() => router.push(user ? roleHome(user.role) : '/login'), 800);
      },
      onError: (err) => setServerError(errorMessage(err)),
    });
  });

  return (
    <div className="grid-texture" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
          <div className="brand-mark">R</div>
          <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>Relay</div>
        </div>

        <div className="panel rise" style={{ padding: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>SECURITY</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>비밀번호 변경</h1>
          <p style={{ margin: '8px 0 22px', color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.55 }}>
            첫 로그인이거나 초기화된 계정은 보안을 위해 비밀번호를 변경해야 합니다.
          </p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <Field label="현재 비밀번호" type="password" reg={register('currentPassword')} err={errors.currentPassword?.message} />
            <Field label="새 비밀번호" type="password" reg={register('newPassword')} err={errors.newPassword?.message} />
            <Field label="새 비밀번호 확인" type="password" reg={register('confirmPassword')} err={errors.confirmPassword?.message} />

            {serverError && (
              <div className="panel" style={{ padding: '10px 13px', borderColor: 'color-mix(in srgb, var(--danger) 40%, transparent)', background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)', fontSize: 13 }}>
                {serverError}
              </div>
            )}
            {done && (
              <div className="panel" style={{ padding: '10px 13px', borderColor: 'color-mix(in srgb, var(--st-completed) 40%, transparent)', background: 'color-mix(in srgb, var(--st-completed) 10%, transparent)', color: 'var(--st-completed)', fontSize: 13 }}>
                변경되었습니다. 콘솔로 이동합니다…
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ height: 44, marginTop: 4 }} disabled={changePassword.isPending}>
              {changePassword.isPending ? <span className="spinner" /> : '비밀번호 변경'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, reg, err }: { label: string; type: string; reg: UseFormRegisterReturn; err?: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input type={type} {...reg} className="input" style={{ marginTop: 7 }} />
      {err && <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6, display: 'block' }}>{err}</span>}
    </div>
  );
}
