import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl flex justify-between items-center w-full px-10 h-16 sticky top-0 z-40">
      <div className="flex items-center gap-6 flex-1">
        <span className="font-manrope font-extrabold text-teal-900 dark:text-teal-50 tracking-tight text-lg">Culinary Architect</span>
        <div className="relative w-96 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" data-icon="search">search</span>
          <input className="w-full bg-surface-container-high border-none rounded-md py-2 pl-10 pr-4 text-sm focus:ring-0 focus:bg-surface-container-lowest transition-all" placeholder="Search inventory..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-full transition-colors active:scale-90">
          <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
        </button>
        <button className="p-2 text-slate-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-full transition-colors active:scale-90">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden bg-surface-container-highest">
          <Image className="w-full h-full object-cover" alt="User Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAprIdTv7OEAxkdKiExdaKV4gSY48DVphIqwu0_NiqcRv8vQNuuTEpKjSgJoxKny_VzD0TKBBYyXwZwhMRvozon7OxJTv_BlLbgxCtiIJtG_zM1Q9Gv9clBRvlTc5LMFI3YyL14OzE4PUy4sO8GRNIdPjXI3RWfVu4Oir9bw78UdlWywE8tVXzlrYgIfzIezS26Nc7kSb9eQqdbS_jjIlx5vex7ofTtyCWcu0bPwt54tjqRrqWP83q_cvmWbd196IZwMajMgNwc3Jo" width={32} height={32}/>
        </div>
      </div>
    </header>
  );
};

export default Header;