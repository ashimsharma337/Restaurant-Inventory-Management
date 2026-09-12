import styles from '@/styles/landing/LoginPage.module.scss';

const badges = [
  ['verified_user', 'AES-256 Encryption'],
  ['gpp_good', 'SOC2 Compliant'],
  ['language', 'EU-GDPR Ready'],
];

export default function SecurityBadges() {
  return (
    <aside className={styles.securityBadges} aria-label="Security information">
      {badges.map(([icon, label]) => (
        <div className={styles.securityBadge} key={label}>
          <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </div>
      ))}
    </aside>
  );
}