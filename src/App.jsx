import React, { useState, useEffect } from 'react';

function App() {
  const [isVisible, setIsVisible] = useState(false); //for fade-in effect
  const [isDown, setIsDown] = useState(false); //for slide up effect
  const [isClicked, setIsClicked] = useState(false); //for click effect

  useEffect(() => {
    setIsVisible(true);
  }, []);

   useEffect(() => {
    // Trigger after component mounts
    const timer = setTimeout(() => {
      setIsDown(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isClicked) {
      // Text moves up when clicked
      // You can add more animations here
      console.log('Image clicked!');
    }
  }, [isClicked]); 

   useEffect(() => {
    if (isClicked) {
      // Move image to the right or change its position
      // This triggers based on isClicked state
    }
  }, [isClicked]);

  const handleImageClick = () => {
    setIsClicked(true); // This triggers all useEffects that depend on isClicked
  };

  return (
    <div id="background" className="h-screen flex justify-center items-center h-dvh ">
      <div className="w-full h-full text-center flex flex-col justify-center items-center ">
       
      <div className={`z-10 transition-opacity duration-2000 text-[70px] md:text-[100px] text-white text-bold ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <img src="/logo.png"  alt="logo" className={`transition-all duration-700 ease-in-out 
        hover:-rotate-180 hover:scale-110 
        hover:drop-shadow-[0_0_20px_rgba(0,72,85)]
       w-[80px] h-[80px] md:w-[100px] md:h-[100px] 
        ${isVisible ? 'opacity-100' : 'opacity-0'}
         ${isClicked ? 'translate-y-[-250px] scale-70' : ''}`}
         onClick={() => setIsClicked(!isClicked)} />
      </div>

        <h1 className={`transition-all duration-2000 text-[70px] md:text-[100px] text-white text-bold 
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${isClicked ? 'translate-y-[-280px] scale-70' : ''}`}
          >WELCOME!</h1>
        <p className={`transition-all duration-2000 text-base md:text-xl text-white 
          ${isVisible ? 'opacity-100' : 'opacity-0'}
           ${isClicked ? 'translate-y-[-300px] scale-80' : ''}`}>Feel free to explore my portfolio!</p>
         
      </div>

    <div className="absolute bottom-0 top-210 md:top-190 left-0 w-full h-[300px] flex justify-center items-center">
      <img 
       onClick={handleImageClick}
      className={`w-[300px] hover:translate-y-[-40px] hover: transition-all duration-700 ease-out 
      hover:shadow-[0_0_100px_rgba(0,72,85)]
        ${isDown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} src="/back.png" alt="card" />
    </div>

    </div>
  );
}

export default App;
