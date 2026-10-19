//логотип над формами входа и регистрации
export default function AuthLogo() {
  return (
    <div className="auth-logo">
      <span className="auth-logo-mark" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c.5 3 3 4.5 4.5 7a6.5 6.5 0 1 1-11.6 1.5c.6 1 1.6 1.7 2.6 1.9C7 10 9.5 6.5 12 3Z" />
        </svg>
      </span>
      StudyHub
    </div>
  );
}
