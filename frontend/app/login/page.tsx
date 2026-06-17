'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { roleHome, setToken } from '@/lib/auth';
import { useLogin } from '@/features/auth/hooks';

const schema = z.object({
  username: z.string().min(1, '아이디를 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});
type FormValues = z.infer<typeof schema>;

function errorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string | string[] } } };
  const msg = e.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg ?? '로그인에 실패했습니다';
}

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    login.mutate(values, {
      onSuccess: (data) => {
        setToken(data.accessToken);
        if (data.requiresPasswordChange) {
          router.push('/change-password');
        } else {
          router.push(roleHome(data.user.role));
        }
      },
      onError: (err) => setServerError(errorMessage(err)),
    });
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="mt-1 text-sm text-gray-500">초기 계정: superadmin / superadmin123!</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">아이디</label>
          <input
            {...register('username')}
            className="rounded border border-gray-300 px-3 py-2"
            autoComplete="username"
          />
          {errors.username && (
            <span className="text-xs text-red-600">{errors.username.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">비밀번호</label>
          <input
            type="password"
            {...register('password')}
            className="rounded border border-gray-300 px-3 py-2"
            autoComplete="current-password"
          />
          {errors.password && (
            <span className="text-xs text-red-600">{errors.password.message}</span>
          )}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={login.isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {login.isPending ? '로그인 중…' : '로그인'}
        </button>
      </form>
    </main>
  );
}
