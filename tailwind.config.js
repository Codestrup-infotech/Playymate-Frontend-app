/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/pages/**/*.{js,jsx}",
  ],
  theme: { extend: {

    animation: {
        "spin-slow": "spin 12s linear infinite",
        "spin-slow-reverse": "spin 6s linear reverse",
      },

       fontFamily: {

        'Poppins':['Poppins','sans-serif'],
        'Playfair Display':['Playfair Display','serif']
      },
      
       screens: {
      sm: "640px",
      md: "768px",
      custom: "800px", // ✅ YOUR CUSTOM BREAKPOINT
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

  }


  
},


  

  plugins: [],
};
