import React, { useState, useEffect } from 'react';

function App() {
  //fade in effect 
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  //rotate and scale effect on hover
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  //when the card is clicked
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (isClicked) {
      // Text moves up when clicked
      // You can add more animations here
      console.log('Image clicked!');
      
      // Move image to the right or change its position
      // This triggers based on isClicked state
    }
  }, [isClicked]);

  const handleImageClick = () => {
    setIsClicked(true); // This triggers the useEffect that depends on isClicked
  };

  //card image list 
  const cards = [
    { id: 1, image: '/back.png', title: 'Card 1', description: 'This is card 1' },
    { id: 2, image: '/back.png', title: 'Card 2', description: 'This is card 2' },
    { id: 3, image: '/back.png', title: 'Card 3', description: 'This is card 3' },
    { id: 4, image: '/back.png', title: 'Card 4', description: 'This is card 4' },
  ];

  //when click will go back at the top
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
      {/* hero section */}
      <div id="hero" className="relative w-full h-[100vh] flex flex-col items-center justify-center">
        <div className={`w-[70px] h-[70px] md:w-[100px] md:h-[100px] transition-all duration-1000 z-20
          ${isVisible ? 'opacity-100' : 'opacity-0'} 
          ${isClicked ? 'translate-y-[-270px] scale-80' : ''}
         `}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          <img 
            className={`transition-all duration-1000 
              cursor-pointer
               ${isHovered ? 'scale-150 rotate-360' : 'scale-100 rotate-0'}`}
            onClick={() => setIsClicked(!isClicked)}
            src="/logo.png" alt="Logo" />
        </div>

        <div className={`text-center z-10 transition-all duration-1000 
          ${isVisible ? 'opacity-100' : 'opacity-0'}
           ${isClicked ? 'translate-y-[-300px] scale-70' : ''}`}>
          <h1 className={`text-[70px] md:text-[100px] font-bold transition-all duration-1000 `}> WELCOME ! </h1>
          <p className="text-base md:text-xl">Feel free to explore my portfolio.</p>
        </div>

        {/* card will show when click */}
        <div className={'card absolute bottom-[-340px] w-[300px] flex justify-center z-10'}>
          <img  
            onClick={handleImageClick}
            src="/back.png" 
            alt="back" 
            className={`transition-all duration-1000 cursor-pointer
              hover:translate-y-[-50px] hover:drop-shadow-[0_0_20px_rgba(0,72,85)]
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              ${isClicked ? 'translate-y-[200px]' : ''}`} 
          />
        </div>
      </div>

      {/* about me */}
      <div className="relative w-full h-[100vh] gap-10 flex flex-col items-center justify-center bg-white transition-all duration-1000 z-20">
       
       <div>
        <h1 className="text-[50px] md:text-[80px] font-bold text-[#004855]">About me.</h1>
        <p className="text-base md:text-xl text-black">go back pls. - jani</p>
       </div>

      {/* 404  */}
      <div className="w-100 md:w-150">
        <img 
        onClick={scrollToElement}
        src="/404.png" alt="404" />
      </div>

    <div className={`fixed bottom-8 right-8 w-[70px] h-[70px] md:w-[100px] md:h-[100px] transition-all duration-1000 z-50 flex flex-col items-center p-4 shadow-lg`}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}>
  <p className='text-[#004855] text-xs mb-1'>Go up</p>
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