const ExpandedHoneycomb = () => {
  // Expanded ideoramas: added 2 to each layer for a larger grid
  const ideoramas = [
    ['Ideorama 1', 'Ideorama 2', 'Ideorama 3', 'Ideorama A', 'Ideorama B'],
    [
      'Ideorama 4',
      'Ideorama 5',
      'Ideorama 6',
      'Ideorama 7',
      'Ideorama C',
      'Ideorama D',
    ],
    [
      'Ideorama 8',
      'Ideorama 9',
      'Ideorama 10',
      'Ideorama 11',
      'Ideorama 12',
      'Ideorama E',
      'Ideorama F',
    ],
    [
      'Ideorama 13',
      'Ideorama 14',
      'Ideorama 15',
      'Ideorama 16',
      'Ideorama G',
      'Ideorama H',
    ],
    ['Ideorama 17', 'Ideorama 18', 'Ideorama 19', 'Ideorama I', 'Ideorama J'],
  ];

  // Geometric Constants
  const hexWidth = 140; // Width from flat side to flat side
  const hexHeight = hexWidth * 1.1547; // Mathematical height for pointy top
  const gap = 12; // Universal spacing (Top, Bottom, Left, Right)

  return (
    <div className=" flex items-center justify-center md:my-10! p-4 overflow-auto opacity-75 ">
      <div className="flex flex-col items-center scale-75 md:scale-100 transition-transform">
        {ideoramas.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center"
            style={{
              marginTop: rowIndex === 0 ? 0 : `-${hexHeight * 0.25 - gap}px`,
            }}
          >
            {row.map((ideorama, colIndex) => (
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
                    <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                      <span className="text-white font-bold text-xs uppercase tracking-widest group-hover:text-white/70 transition-colors">
                        {ideorama}
                      </span>
                    </div>

                    {/* 
                    <img 
                      src={`/path/to/${ideorama}.jpg`} 
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
