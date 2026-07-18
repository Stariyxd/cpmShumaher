export default function Home() {
  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>CPM Shumaher Hub</h1>
        <p>Информационный дашборд: Car Parking & Landmand Simulator</p>
      </header>

      <section>
        <h2>Ссылки</h2>
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <a href="https://t.me/shumahercpm" style={linkStyle}>Мой Telegram-канал</a>
          <a href="https://tiktok.com/@shumahercpm" style={linkStyle}>TikTok</a>
        </div>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Новости проектов</h2>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>Новости от Адиля Тасимова</h3>
          <p>Актуальная информация по проектам студии Olzhass Games будет здесь.</p>
        </div>
      </section>

      <footer style={{ marginTop: '50px', fontSize: '0.8em', color: '#666', textAlign: 'center' }}>
        <p>Личный проект. Не является официальным ресурсом разработчиков.</p>
      </footer>
    </main>
  );
}

const linkStyle = {
  padding: '10px',
  background: '#f0f0f0',
  borderRadius: '5px',
  textDecoration: 'none',
  color: '#333',
  border: '1px solid #ddd'
};