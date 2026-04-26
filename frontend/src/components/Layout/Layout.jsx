import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div style={{ background: '#f9f9f9', minHeight: '100vh' }}>
      <Topbar />
      <Sidebar />
      <main style={{
        marginLeft: '220px',
        marginTop: '56px',
        padding: '24px',
        minHeight: 'calc(100vh - 56px)',
      }}>
        {children}
      </main>
    </div>
  );
}