/**
 * Payment lock screen — empty white page while the account is inactive.
 * On by default. Set VITE_BLANK_SCREEN=false in frontend/.env to unlock, then restart Vite.
 */
export default function BlankScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        margin: 0,
        padding: 0,
        background: '#ffffff',
        width: '100vw',
        height: '100vh',
      }}
      aria-hidden="true"
    />
  );
}
