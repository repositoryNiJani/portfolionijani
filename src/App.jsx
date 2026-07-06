function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDown, setIsDown] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDown(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    // Change h-screen to h-dvh AND add overflow-hidden
    <div id="background" className="h-dvh overflow-hidden flex justify-center items-center">
      <div className="w-full h-full text-center flex flex-col justify-center items-center relative">
        
        <div className={`transition-opacity duration-4000 text-[70px] md:text-[100px] text-white text-bold ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <img 
            src="/logo.png"  
            alt="logo" 
            className={`transition-all duration-700 ease-in-out 
            hover:-rotate-180 hover:scale-110 
            hover:drop-shadow-[0_0_20px_rgba(0,72,85)]
            w-[60px] h-[60px] md:w-[100px] md:h-[100px] 
            ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
          />
        </div>

        <h1 className={`transition-opacity duration-4000 text-[50px] md:text-[100px] text-white text-bold ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          WELCOME!
        </h1>
        
        <p className={`transition-opacity duration-6000 text-sm md:text-xl text-white ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          Feel free to explore my portfolio!
        </p>

        {/* Bottom Image - Use flex positioning instead of absolute */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center">
          <img 
            className={`w-[200px] md:w-[300px] hover:translate-y-[-40px] transition-all duration-700 ease-out 
            hover:shadow-[0_0_100px_rgba(0,72,85)]
            ${isDown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
            src="/back.png" 
            alt="card" 
          />
        </div>
      </div>
    </div>
  );
}