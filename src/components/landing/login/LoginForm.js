import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/landing/LoginPage.module.scss';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    window.location.assign('/dashboard');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <label htmlFor="email">Work Email</label>
        <div className={styles.inputWrap}>
          <span className="material-symbols-outlined" aria-hidden="true">alternate_email</span>
          <input id="email" name="email" placeholder="chef@grandbistro.com" type="email" autoComplete="email" required />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="password">Password</label>
          <Link href="/help">Forgot?</Link>
        </div>
        <div className={styles.inputWrap}>
          <span className="material-symbols-outlined" aria-hidden="true">lock</span>
          <input
            id="password"
            name="password"
            placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
          />
          <button
            className={styles.visibilityButton}
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>

      <label className={styles.rememberRow}>
        <input type="checkbox" name="remember-me" />
        <span>Keep me signed in for 30 days</span>
      </label>

      <button className={styles.submitButton} type="submit">
        <span>Access Dashboard</span>
        <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </button>
    </form>
  );
}