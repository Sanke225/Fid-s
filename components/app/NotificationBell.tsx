'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { BellIcon } from '@/components/Icons';
import { EASE } from '@/components/motion/easing';
import { timeAgo } from '@/lib/delivery-ui';
import { useMarkNotificationsSeen, useNotifications } from '@/lib/queries/notifications';

/** Cloche de la barre du haut : les non-lues sont signalées, tout passe en lu à la fermeture. */
export function NotificationBell() {
  const { data } = useNotifications();
  const markSeen = useMarkNotificationsSeen();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const unread = data?.unreadCount ?? 0;

  const close = () => {
    setOpen(false);
    if (unread > 0) markSeen.mutate();
  };
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && closeRef.current();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={unread ? `Notifications : ${unread} non lue${unread > 1 ? 's' : ''}` : 'Notifications'}
        className="relative grid size-10 place-items-center rounded-xl text-f-text hover:bg-f-surface"
      >
        <BellIcon size={19} />
        {unread ? (
          <span className="absolute right-1.5 top-1.5 grid min-w-[18px] place-items-center rounded-full bg-[#C84A00] px-1 text-[10.5px] font-bold leading-[18px] text-white tabular-nums">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute right-0 top-12 z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-f-line bg-f-card shadow-f-float"
          >
            <div className="flex items-center justify-between border-b border-f-line px-4 py-3">
              <p className="text-[14.5px] font-bold">Notifications</p>
              {unread ? (
                <button type="button" onClick={() => markSeen.mutate()} className="text-[12.5px] font-semibold text-f-ink-accent hover:underline">
                  Tout marquer comme lu
                </button>
              ) : null}
            </div>
            {!data || data.items.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13.5px] text-f-muted">Aucune notification pour l’instant.</p>
            ) : (
              <ul className="max-h-[60vh] divide-y divide-[var(--color-divider)] overflow-y-auto">
                {data.items.map(n => (
                  <li key={n.id}>
                    <Link href={n.href} onClick={close} className={`flex gap-3 px-4 py-3 hover:bg-f-surface ${n.unread ? 'bg-[var(--color-accent-100)]/40' : ''}`}>
                      <span aria-hidden className={`mt-1.5 size-2 shrink-0 rounded-full ${n.unread ? 'bg-[#C84A00]' : 'bg-transparent'}`} />
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-semibold">{n.title}</span>
                        <span className="block text-[13px] leading-snug text-f-muted">{n.body}</span>
                        <span className="mt-0.5 block text-[11.5px] text-f-muted">{timeAgo(n.occurredAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
