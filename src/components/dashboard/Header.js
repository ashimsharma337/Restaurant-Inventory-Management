// src/components/dashboard/Header.js

import Image from 'next/image';
import SearchInput from '@/components/dashboard/SearchInput';
import styles from '@/styles/header/Header.module.scss';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <span className={styles.brandName}>
          Culinary Architect
        </span>

        {/* SearchInput handles its own state via useInventoryFilters hook */}
        <SearchInput />
      </div>

      <div className={styles.actions}>
        <button className={styles.actionButton} type="button" aria-label="Notifications">
          <span className="material-symbols-outlined" data-icon="notifications">
            notifications
          </span>
        </button>
        <button className={styles.actionButton} type="button" aria-label="Settings">
          <span className="material-symbols-outlined" data-icon="settings">
            settings
          </span>
        </button>
        <div className={styles.avatar}>
          <Image
            className={styles.avatarImage}
            alt="User Profile"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAprIdTv7OEAxkdKiExdaKV4gSY48DVphIqwu0_NiqcRv8vQNuuTEpKjSgJoxKny_VzD0TKBBYyXwZwhMRvozon7OxJTv_BlLbgxCtiIJtG_zM1Q9Gv9clBRvlTc5LMFI3YyL14OzE4PUy4sO8GRNIdPjXI3RWfVu4Oir9bw78UdlWywE8tVXzlrYgIfzIezS26Nc7kSb9eQqdbS_jjIlx5vex7ofTtyCWcu0bPwt54tjqRrqWP83q_cvmWbd196IZwMajMgNwc3Jo"
            width={32}
            height={32}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;