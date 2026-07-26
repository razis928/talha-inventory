import { ReactNode } from 'react';

interface ScreenFrameProps {
  title: string;
  subtitle?: string;
  toolbar?: ReactNode;
  formPanel?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

export default function ScreenFrame({ title, toolbar, formPanel, children, footer }: ScreenFrameProps) {
  return (
    <div className="erp-document">
      <div className="erp-titlebar">{title}</div>

      {toolbar && <div className="erp-toolbar">{toolbar}</div>}
      {formPanel && <div className="erp-form-panel">{formPanel}</div>}

      <div className="erp-document-body">{children ?? null}</div>

      {footer && (
        <div className="erp-toolbar border-t border-b-0">
          {footer}
        </div>
      )}
    </div>
  );
}
