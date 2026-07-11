import React, { useState, useEffect } from 'react';

function App() {
  // Fade in effect 
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Rotate and scale effect on hover
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // When the card is clicked
  const [isClicked, setIsClicked] = useState(false);

  // Card image list 
  const cards = [
    { id: 1, image: '/back.png', title: 'Card 1', description: 'This is card 1' },
    { id: 2, image: '/back.png', title: 'Card 2', description: 'This is card 2' },
    { id: 3, image: '/back.png', title: 'Card 3', description: 'This is card 3' },
    { id: 4, image: '/back.png', title: 'Card 4', description: 'This is card 4' },
  ];

  // Scroll back to top
  const scrollToElement = () => {
    const element = document.getElementById('hero');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen text-white">
      {/* Hero section */}
      <div id="hero" className={`relative w-full ${isClicked ? 'h-[130vh]' : ''} h-[100vh] md:h-[100vh] flex flex-col items-center justify-center`}>
        
        {/* Logo */}
        <div 
          className={`w-[70px] h-[70px] md:w-[100px] md:h-[100px] transition-all duration-1000 z-20
            ${isVisible ? 'opacity-100' : 'opacity-0'} 
            ${isClicked ? 'translate-y-[-20px] scale-80' : ''}
          `}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img 
            className={`transition-all duration-1000 cursor-pointer
              ${isHovered ? 'scale-150 rotate-[360deg]' : 'scale-100 rotate-0'}`}
            onClick={() => setIsClicked(!isClicked)}
            src="/logo.png" 
            alt="Logo" 
          />
        </div>

        {/* Welcome Text */}
        <div className={`text-center z-10 transition-all duration-1000 
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${isClicked ? 'translate-y-[-50px] scale-70' : ''}
        `}>
          <h1 className="text-[70px] md:text-[100px] font-bold transition-all duration-1000">
            WELCOME!
          </h1>
          <p className="text-base md:text-xl">Feel free to explore my portfolio.</p>
        </div>

        {/* Single Card Trigger */}
        <div className="card absolute bottom-[-340px] w-[300px] flex justify-center z-10">
          <img  
            onClick={() => setIsClicked(!isClicked)}
            src="/back.png" 
            alt="back" 
            className={`transition-all duration-1000 cursor-pointer
              hover:translate-y-[-50px] hover:drop-shadow-[0_0_20px_rgba(0,72,85)]
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              ${isClicked ? 'translate-y-[200px]' : ''}
            `} 
          />
        </div>

        {/* Cards Popup - Using map to render dynamically */}
        <div className={`w-full max-w-[1000px] mx-auto transition-all duration-1000 z-10
          ${isClicked ? 'opacity-100 translate-y-0 max-h-[1000px]' : 'opacity-0 translate-y-60 max-h-0 overflow-hidden'}
        `}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="flex flex-col items-center">
                <img  
                  src={card.image} 
                  alt={card.title} 
                  className="w-full h-auto max-w-[200px] md:max-w-[300px] transition-all duration-500 cursor-pointer
                    hover:translate-y-[-50px] hover:drop-shadow-[0_0_20px_rgba(0,72,85)]
                    hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* About Me Section */}
      <div className="relative w-full h-[100vh] gap-10 flex flex-col items-center justify-center bg-white transition-all duration-1000 z-20">
        
        <div>
          <h1 className="text-[50px] md:text-[80px] font-bold text-[#004855]">About me.</h1>
          <p className="text-base md:text-xl text-black">go back pls. - jani</p>
        </div>

        {/* 404 Image */}
        <div className="w-100 md:w-150">
          <img 
            onClick={scrollToElement}
            src="/404.png" 
            alt="404" 
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </div>

        {/* Back to Top Button */}
        <div 
          className={`fixed bottom-8 right-8 w-[70px] h-[70px] md:w-[100px] md:h-[100px] transition-all duration-1000 z-50 flex flex-col items-center`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <p className="text-[#004855] text-xs mb-1">Go up</p>
          <img 
            className={`transition-all duration-1000 cursor-pointer
              ${isHovered ? 'scale-150 rotate-[360deg]' : 'scale-100 rotate-0'}`}
            onClick={scrollToElement}
            src="/logo.png" 
            alt="Go to top" 
          />
        </div>
      </div>
    </div>
  );
}

export default App;