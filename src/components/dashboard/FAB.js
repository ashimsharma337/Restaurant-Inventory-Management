const FAB = () => {
  return (
    <button className="fixed bottom-10 right-10 h-14 w-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group" style={{boxShadow: '0 12px 32px -4px rgba(25, 28, 29, 0.15)'}}>
      <span className="material-symbols-outlined text-3xl" data-icon="barcode_scanner">barcode_scanner</span>
      <span className="absolute right-16 bg-on-surface text-surface text-[10px] font-bold py-1 px-3 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest pointer-events-none">Scan Quick SKU</span>
    </button>
  );
};

export default FAB;