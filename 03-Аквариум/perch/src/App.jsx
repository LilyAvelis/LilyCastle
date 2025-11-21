import { createSignal } from 'solid-js';

function App() {
  const [message, setMessage] = createSignal('Привет, Окунь!');

  const changeMessage = () => {
    setMessage('Ты кликнула на рыбу!');
  };

  return (
    <div style={{ 'text-align': 'center', 'background': 'linear-gradient(to right, #4facfe, #00f2fe)', 'min-height': '100vh', 'display': 'flex', 'align-items': 'center', 'justify-content': 'center' }}>
      <div>
        <h1 style={{ 'font-size': '3rem', 'color': '#fff', 'margin-bottom': '1rem' }}>🐟 Окунь в Аквариуме</h1>
        <p style={{ 'font-size': '1.5rem', 'color': '#fff', 'margin-bottom': '2rem' }}>{message()}</p>
        <button
          onClick={changeMessage}
          style={{ 'padding': '0.75rem 1.5rem', 'background': '#fff', 'color': '#4facfe', 'border': 'none', 'border-radius': '0.5rem', 'cursor': 'pointer', 'transition': 'transform 0.2s' }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Кликни на рыбу
        </button>
      </div>
    </div>
  );
}

export default App;