import BrandPanel from './BrandPanel';
import LoginForm from './LoginForm';
import SecurityBadges from './SecurityBadges';
import SocialAuth from './SocialAuth';
import styles from '@/styles/landing/LoginPage.module.scss';
import Head from 'next/head';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login | Culinary Architect</title>
        <meta name="description" content="Sign in to manage your Culinary Architect kitchen inventory." />
      </Head>
      <main className={styles.page}>
        <div className={styles.loginCard}>
          <BrandPanel />
          <section className={styles.formPanel} aria-labelledby="welcome-heading">
            <div className={styles.mobileLogo}>
              <div className={styles.mobileLogoMark}>
                <span className="material-symbols-outlined" aria-hidden="true">restaurant_menu</span>
              </div>
            </div>
            <div className={styles.formHeader}>
              <h2 id="welcome-heading">Welcome Back</h2>
              <p>Sign in to manage your kitchen central.</p>
            </div>
            <LoginForm />
            <SocialAuth />
            <p className={styles.salesPrompt}>
              New to Culinary Architect? <a href="mailto:sales@culinaryarchitect.example">Contact Sales for an Account</a>
            </p>
          </section>
        </div>
        <SecurityBadges />
      </main>
    </>
  );
}