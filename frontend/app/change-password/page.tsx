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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">비밀번호 변경</h1>
        <p className="mt-1 text-sm text-gray-500">
          첫 로그인 또는 초기화된 계정은 비밀번호를 변경해야 합니다.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="현재 비밀번호" type="password" reg={register('currentPassword')} err={errors.currentPassword?.message} />
        <Field label="새 비밀번호" type="password" reg={register('newPassword')} err={errors.newPassword?.message} />
        <Field label="새 비밀번호 확인" type="password" reg={register('confirmPassword')} err={errors.confirmPassword?.message} />

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        {done && <p className="text-sm text-green-600">변경되었습니다. 이동 중…</p>}

        <button
          type="submit"
          disabled={changePassword.isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {changePassword.isPending ? '변경 중…' : '비밀번호 변경'}
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  type,
  reg,
  err,
}: {
  label: string;
  type: string;
  reg: UseFormRegisterReturn;
  err?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input type={type} {...reg} className="rounded border border-gray-300 px-3 py-2" />
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
