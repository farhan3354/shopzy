import React from 'react'

export default function TopSlide({announcementMessages,currentSlide}) {
  return (
    <>
         <div
        style={{
          background:
            "radial-gradient(206px 75.13px, #be386e 0%, #8f2a53 80%, #68012a 100%)",
        }}
      >
        <div className="relative overflow-hidden">
          <div className="splide__track">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {announcementMessages.map((message, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="py-2 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <message.icon className="w-5 h-5 text-white animate-pulse" />
                      <span className="text-white font-bold text-sm md:text-base tracking-wide">
                        {message.text}
                      </span>
                      <message.icon className="w-5 h-5 text-white animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {announcementMessages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div> */}
        </div>
      </div>
    </>
  )
}
