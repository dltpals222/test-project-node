'use client';

import { useMutation } from '@tanstack/react-query';
import { decodeJwt } from 'jose';
import { useEffect, useState } from 'react';
import { clearToken, getToken, type Role, type SessionUser } from '@/lib/auth';
import { changePassword, login } from './api';

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}

/** 현재 토큰을 디코드해 세션 사용자 정보를 반환(클라이언트 전용, UX 용도). */
export function useSession(): { user: SessionUser | null; logout: () => void } {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const payload = decodeJwt(token);
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        clearToken();
        setUser(null);
        return;
      }
      setUser({
        id: Number(payload.sub),
        username: String(payload.username ?? ''),
        role: payload.role as Role,
      });
    } catch {
      setUser(null);
    }
  }, []);

  const logout = () => {
    clearToken();
    setUser(null);
    window.location.href = '/login';
  };

  return { user, logout };
}
