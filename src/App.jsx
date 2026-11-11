import { useEffect } from 'react';
import portfolioMarkup from './portfolio.html?raw';
import { initKoiPond } from './koiPond.js';

function App() {
  useEffect(() => {
    void import('../script.js');
    const hero = document.getElementById('top');
    const stopKoi = hero ? initKoiPond(hero) : undefined;
    return () => {
      if (stopKoi) stopKoi();
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: portfolioMarkup }} />;
}

export default App;
