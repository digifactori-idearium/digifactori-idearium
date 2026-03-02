const ExpandedHoneycomb = () => {
  // Expanded rooms: added 2 to each layer for a larger grid
  const rooms = [
    ['Room 1', 'Room 2', 'Room 3', 'Room A', 'Room B'],
    ['Room 4', 'Room 5', 'Room 6', 'Room 7', 'Room C', 'Room D'],
    ['Room 8', 'Room 9', 'Room 10', 'Room 11', 'Room 12', 'Room E', 'Room F'],
    ['Room 13', 'Room 14', 'Room 15', 'Room 16', 'Room G', 'Room H'],
    ['Room 17', 'Room 18', 'Room 19', 'Room I', 'Room J'],
  ];

  // Geometric Constants
  const hexWidth = 140; // Width from flat side to flat side
  const hexHeight = hexWidth * 1.1547; // Mathematical height for pointy top
  const gap = 12; // Universal spacing (Top, Bottom, Left, Right)

  return (
    <div className=" flex items-center justify-center md:my-10! p-4 overflow-auto opacity-75 ">
      <div className="flex flex-col items-center scale-75 md:scale-100 transition-transform">
        {rooms.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center"
            style={{
              marginTop: rowIndex === 0 ? 0 : `-${hexHeight * 0.25 - gap}px`,
            }}
          >
            {row.map((room, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="relative group cursor-pointer transition-transform duration-300 hover:z-50 hover:scale-110"
                style={{
                  width: `${hexWidth}px`,
                  height: `${hexHeight}px`,
                  margin: `0 ${gap / 2}px`,
                }}
              >
                <div
                  className="w-full h-full bg-background dark:bg-mauve shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 border-white/5 group-hover:border-white/20"
                  style={{
                    clipPath:
                      'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                >
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                      <img
                        src="https://cdn.shadcnstudio.com/ss-assets/components/card/image-5.png?width=368&format=auto"
                        alt="alt"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    {/* <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                      <span className="text-white font-bold text-xs uppercase tracking-widest group-hover:text-white/70 transition-colors">
                        {room}
                      </span>
                    </div> */}

                    {/* 
                    <img 
                      src={`/path/to/${room}.jpg`} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    /> 
                    */}

                    <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpandedHoneycomb;
