import styles from '@/styles/landing/LoginPage.module.scss';

const testimonials = [
  ['MC', 'Marco Chen'],
  ['AR', 'Ana Ruiz'],
  ['JL', 'Jon Lee'],
];

export default function BrandPanel() {
  return (
    <section className={styles.brandPanel} aria-labelledby="brand-heading">
      <div className={styles.decorativeTop} aria-hidden="true" />
      <div className={styles.decorativeBottom} aria-hidden="true" />
      <div className={styles.brandContent}>
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>
            <span className="material-symbols-outlined" aria-hidden="true">restaurant_menu</span>
          </div>
          <span className={styles.logoName}>Culinary Architect</span>
        </div>
        <h1 id="brand-heading" className={styles.brandHeading}>
          Precision in every <br />
          <span>Ingredient.</span>
        </h1>
        <p className={styles.brandDescription}>
          Elevate your kitchen operations with enterprise-grade inventory management designed for the modern culinary landscape.
        </p>
      </div>
      <div className={styles.trustRow}>
        <div className={styles.avatarGroup} aria-hidden="true">
          {testimonials.map(([initials, name]) => (
            <span className={styles.avatar} key={name} title={name}>{initials}</span>
          ))}
        </div>
        <p>Trusted by 2,000+ Michelin-star kitchens</p>
      </div>
    </section>
  );
}