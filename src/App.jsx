import { useEffect } from 'react';
import portfolioMarkup from './portfolio.html?raw';

function App() {
  useEffect(() => {
    void import('../script.js');
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: portfolioMarkup }} />;
}

export default App;
