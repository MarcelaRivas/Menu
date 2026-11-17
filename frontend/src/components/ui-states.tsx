import type { ReactNode } from 'react';

/** Estado de carga común del panel. */
export function LoadingState({ text = 'Cargando…' }: { text?: string }) {
  return <p className="text-[13px] text-[#8D9590]" role="status">{text}</p>;
}

/** Mensaje de error común del panel. */
export function ErrorAlert({ message }: { message: string }) {
  return (
    <p role="alert" className="mb-4 rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3.5 py-2.5 text-[13px] text-[#B42318]">
      {message}
    </p>
  );
}

/** Estado vacío común: un mensaje y, opcionalmente, una acción. */
export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-[13px] text-[#8D9590]">{children}</p>
      {action}
    </div>
  );
}
