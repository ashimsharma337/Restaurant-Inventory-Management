import Link from 'next/link';
import styles from '@/styles/shared/Button.module.scss';

const Button = ({
  children,
  href,
  variant = 'primary',
  icon,
  className = '',
  type = 'button',
  ...props
}) => {
  const buttonClassName = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  const content = (
    <>
      {icon && <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </>
  );

  if (href) {
    return <Link className={buttonClassName} href={href} {...props}>{content}</Link>;
  }

  return <button className={buttonClassName} type={type} {...props}>{content}</button>;
};

export default Button;