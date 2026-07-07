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

  const cards = [
  { id: 1, image: '/back.png', title: 'Card 1', description: 'This is card 1' },
  { id: 2, image: '/back.png', title: 'Card 2', description: 'This is card 2' },
  { id: 3, image: '/back.png', title: 'Card 3', description: 'This is card 3' },
  { id: 4, image: '/back.png', title: 'Card 4', description: 'This is card 4' },
];

  const handleImageClick = () => {
    setIsClicked(true); // This triggers all useEffects that depend on isClicked
  };

  

  return (
    <div  className="min-h-screen flex justify-center items-center overflow-y-auto">
      <div className="w-full h-full text-center flex flex-col justify-center items-center ">
       
    
       <div className={`transition-all text-[70px] md:text-[100px] text-white text-bold z-100`}>
        <img src="/logo.png"  alt="logo" className={`transition-all duration-2000 ease-in-out 
        hover:-rotate-180 hover:scale-120 
        hover:drop-shadow-[0_0_20px_rgba(0,72,85)]
       w-[80px] h-[80px] md:w-[100px] md:h-[100px] 
        ${isVisible ? 'opacity-100' : 'opacity-0'}
         ${isClicked ? 'translate-y-[-250px] scale-70' : ''}`}
         onClick={() => setIsClicked(!isClicked)} />
      </div>

        <h1 className={`transition-all duration-2000 text-[70px] md:text-[100px] text-white text-bold z-50
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${isClicked ? 'translate-y-[-280px] scale-70' : ''}`}
          >WELCOME!</h1>
        <p className={`transition-all duration-2000 text-base md:text-xl text-white z-50
          ${isVisible ? 'opacity-100' : 'opacity-0'}
           ${isClicked ? 'translate-y-[-300px] scale-80' : ''}`}>Feel free to explore my portfolio!</p>
      </div>
    

        {/* card will show when click */}
        {/* <div className={`absolute inset-x-0 transition-all duration-700 max-w-6xl mx-auto px-4 top-70
          ${isClicked ? 'opacity-100 translate-y-0'  : 'opacity-0 translate-y-20 pointer-events-none'}`}>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {cards.map(card => (
              <div key={card.id} className={`p-4 rounded-lg ${card.color} text-white`}>
                <img src={card.image} alt={card.title} className="
                w-[100px] h-[100px]
                md:w-full md:h-full object-cover
                hover:scale-110 transition-transform duration-700 ease-in-out 
                hover:shadow-[0_0_100px_rgba(0,72,85)]
                " />
              </div>
            ))}
          </div>
    </div> */}

   <div className='min-h-screen flex justify-center items-center'>
     <div className={`absolute inset-x-10 md:inset-x-50 transition-all duration-700 top-70
        ${isClicked ? 'opacity-100 translate-y-0'  : 'opacity-0 translate-y-20 pointer-events-none'}`}>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <div>
            <img src="/back.png" alt="card1" className='w-[90%] md:w-full
            hover:scale-110 hover:shadow-[0_0_100px_rgba(0,72,85)]
            transition-all duration-700 ease-in-out' />
            {/* <p>ABOUT ME</p> */}
           </div>
            <div>
            <img src="/back.png" alt="card1" className='w-[90%] md:w-full
            hover:scale-110 hover:shadow-[0_0_100px_rgba(0,72,85)]
            transition-all duration-700 ease-in-out' />
           </div>
            <div>
            <img src="/back.png" alt="card1" className='w-[90%] md:w-full
            hover:scale-110 hover:shadow-[0_0_100px_rgba(0,72,85)]
            transition-all duration-700 ease-in-out' />
           </div>
            <div>
            <img src="/back.png" alt="card1" className='w-[90%] md:w-full
            hover:scale-110 hover:shadow-[0_0_100px_rgba(0,72,85)]
            transition-all duration-700 ease-in-out' />
           </div>
         
          </div>
    </div>
   </div>

    <div className="absolute bottom-0 top-210 md:top-190 left-0 w-full h-[300px] flex justify-center items-center">
      <img 
       onClick={handleImageClick}
      className={`w-[300px] hover:translate-y-[-40px] hover: transition-all duration-1000 ease-out 
      hover:shadow-[0_0_100px_rgba(0,72,85)]
        ${isDown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        ${isClicked ? 'translate-y-[1000px]' : ''}
        `} src="/back.png" alt="card" />
    </div>

    

    </div>
  );
}

export default App;
