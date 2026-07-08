import React, { useState, useEffect } from 'react';

function App() {
//show the section when click
const [showSection, setShowSection] = useState(false);
useEffect(() => {
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const sectionPosition = window.innerHeight; // Adjust this value based on your section's position

    if (scrollPosition >= sectionPosition) {
      setShowSection(true);
    } else {
      setShowSection(false);
    }
  };
  window.addEventListener('scroll', handleScroll);
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);

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


  

  return (
<div className="min-h-screen text-white">

  {/* hero section */}
  <div className="relative w-full h-[100vh] flex flex-col items-center justify-center">
    <div className={`w-[70px] h-[70px] md:w-[100px] md:h-[100px] transition-all duration-1000 z-10
      ${isVisible ? 'opacity-100' : 'opacity-0'} ${isHovered ? 'scale-150 rotate-90' : 'scale-100 rotate-0'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <img src="/logo.png" alt="Logo" />
    </div>
    <div className={`text-center z-10 transition-all duration-1000 
      ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <h1 className="text-[70px] md:text-[100px] font-bold">WELCOME !</h1>
      <p className="text-base md:text-xl">Feel free to explore my portfolio.</p>
    </div>

    {/* card will show when click */}
    <div className="absolute bottom-[-340px] w-[300px] flex justify-center z-10">
      <img src="/back.png" alt="back" className={`transition-all duration-1000 
      hover:translate-y-[-50px] hover:drop-shadow-[0_0_20px_rgba(0,72,85)]
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} />
    </div>
  </div>

  {/* next section */}
      <div  className="relative w-full h-[100vh] flex flex-col items-center justify-center bg-[#004855] z-10">
        <div className="flex flex-col items-center justify-center text-center">
          <h1>SECOND SECTION</h1>
        </div>
      </div>

  
</div>
  );
}

export default App;
