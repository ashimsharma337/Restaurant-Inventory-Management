import styles from '@/styles/landing/LoginPage.module.scss';

export default function SocialAuth() {
  return (
    <div className={styles.socialSection}>
      <div className={styles.divider}>
        <span />
        <span>or continue with</span>
        <span />
      </div>
      <div className={styles.socialGrid}>
        <button className={styles.socialButton} type="button" onClick={() => window.alert('Google sign-in is coming soon.')}>
          <span className={styles.googleMark} aria-hidden="true">G</span>
          <span>Google</span>
        </button>
        <button className={styles.socialButton} type="button" onClick={() => window.alert('SSO sign-in is coming soon.')}>
          <span className="material-symbols-outlined" aria-hidden="true">hub</span>
          <span>SSO</span>
        </button>
      </div>
    </div>
  );
}