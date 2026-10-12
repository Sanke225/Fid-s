'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SpinnerIcon } from './AuthIcons';
import { chooseRole, failureMessage, homeFor, type AccountRole } from './authApi';
import { useSyncMockUser } from './useSyncMockUser';

/** Retour Google avec un rôle choisi avant le départ : on l'enregistre via l'API puis on redirige. */
export function ApplyRole({ role }: { role: AccountRole }) {
  const router = useRouter();
  const syncMock = useSyncMockUser();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    chooseRole(role)
      .then(user => {
        syncMock(user);
        router.replace(homeFor(user.role));
      })
      .catch(e => setError(failureMessage(e)));
  }, [role, router, syncMock]);

  return (
    <div className="landing grid min-h-svh place-items-center bg-f-bg px-4 text-f-text">
      <div className="flex flex-col items-center gap-3 text-center" role="status">
        {error ? (
          <>
            <p className="max-w-sm text-[15px]">{error}</p>
            <button type="button" onClick={() => router.replace('/inscription?etape=role')} className="cta-primary rounded-full px-6 py-3">
              Choisir mon profil
            </button>
          </>
        ) : (
          <>
            <SpinnerIcon size={28} />
            <p className="text-[15px] text-f-muted">Préparation de votre espace…</p>
          </>
        )}
      </div>
    </div>
  );
}
