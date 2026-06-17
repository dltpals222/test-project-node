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
        router.push(data.requiresPasswordChange ? '/change-password' : roleHome(data.user.role));
      },
      onError: (err) => setServerError(errorMessage(err)),
    });
  });

  return (
    <div className="grid-texture login-grid">
      {/* showcase */}
      <section
        className="login-showcase"
        style={{
          position: 'relative',
          padding: '56px 60px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(600px 400px at 20% 30%, var(--accent-glow), transparent 65%)',
          }}
        />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="brand-mark" style={{ width: 36, height: 36, fontSize: 19 }}>R</div>
          <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em' }}>Relay</div>
          <span className="role-badge" style={{ marginLeft: 4 }}>OPS</span>
        </div>

        <div style={{ position: 'relative', marginTop: 'auto', maxWidth: 460 }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>LEAD / CASE ASSIGNMENT CONSOLE</div>
          <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.08, fontWeight: 700, letterSpacing: '-0.035em' }}>
            리드를 받고,<br />
            <span style={{ color: 'var(--accent)' }}>정확히 배정</span>하고,<br />
            끝까지 추적합니다.
          </h1>
          <p style={{ marginTop: 18, color: 'var(--text-dim)', fontSize: 15, lineHeight: 1.6 }}>
            역할 기반 접근 제어와 배정 단위 가시성으로, 팀이 자기 일에만 집중하도록.
          </p>

          <div style={{ display: 'flex', gap: 28, marginTop: 40 }}>
            {[
              ['99.9%', 'API 가용성'],
              ['< 50ms', '배정 지연'],
              ['4단계', 'RBAC 권한'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>{v}</div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', marginTop: 48, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-faint)', fontSize: 12 }}>
          <span className="live-dot" /> 운영 환경 · ap-northeast-2
        </div>
      </section>

      {/* form */}
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>콘솔 로그인</h2>
          <p style={{ margin: '8px 0 28px', color: 'var(--text-dim)', fontSize: 14 }}>계정 정보로 운영 콘솔에 접속하세요.</p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label">아이디</label>
              <input className="input" style={{ marginTop: 7 }} autoComplete="username" placeholder="superadmin" {...register('username')} />
              {errors.username && <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6, display: 'block' }}>{errors.username.message}</span>}
            </div>
            <div>
              <label className="field-label">비밀번호</label>
              <input className="input" style={{ marginTop: 7 }} type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
              {errors.password && <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6, display: 'block' }}>{errors.password.message}</span>}
            </div>

            {serverError && (
              <div className="panel" style={{ padding: '10px 13px', borderColor: 'color-mix(in srgb, var(--danger) 40%, transparent)', background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)', fontSize: 13 }}>
                {serverError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ height: 44, marginTop: 4 }} disabled={login.isPending}>
              {login.isPending ? <span className="spinner" /> : '로그인'}
            </button>
          </form>

          <div className="panel" style={{ marginTop: 22, padding: '12px 14px', background: 'var(--surface-2)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, background: 'var(--surface-3)', color: 'var(--accent)', letterSpacing: '0.05em' }}>DEMO</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>superadmin / superadmin123!</span>
          </div>
        </div>
      </section>
    </div>
  );
}
