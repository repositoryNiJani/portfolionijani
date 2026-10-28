import { useEffect } from 'react';
import portfolioMarkup from './portfolio.html?raw';
import { initKoiPond } from './koiPond.js';

function App() {
  useEffect(() => {
    void import('../script.js');
    const hero = document.getElementById('top');
    return hero ? initKoiPond(hero) : undefined;
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: portfolioMarkup }} />;
}

export default App;