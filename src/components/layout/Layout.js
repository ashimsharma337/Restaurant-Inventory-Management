import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
   <div className="app-layout">
      <Navbar />
      <main className="app-content">
        {children}
      </main>
      <Footer />
   </div>
  );
}
