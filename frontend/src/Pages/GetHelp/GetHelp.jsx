import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "../../Components/Experience";
import { useAvatarStore } from "../../store";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./GetHelp.css";

function GetHelp() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [scriptText, setScriptText] = useState("");
  const [latestUserText, setLatestUserText] = useState("");
  const [matchedLiquors, setMatchedLiquors] = useState([]);
  const [liquorInfo, setLiquorInfo] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSpeakAgain, setShowSpeakAgain] = useState(false);
  // const [isGreeting, setIsGreeting] = useState(true);

  const { setAvatarData } = useAvatarStore();
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const options = [
    // {
    //   label: "Find Products",
    //   endpoint: "/userreply",
    //   icon: "/symbols/findproducts.svg",
    // },
    {
      label: "Liquor University",
      endpoint: "/info-gemini",
      icon: "/symbols/info_40dp_FAF0E6_FILL0_wght400_GRAD0_opsz40.svg",
    },
    // {
    //   label: "Offers",
    //   endpoint: "/getoffers",
    //   icon: "/symbols/sell_40dp_FAF0E6_FILL0_wght400_GRAD0_opsz40.svg",
    // },
    {
      label: "Recipes",
      endpoint: "/suggest",
      icon: "/symbols/lightbulb_40dp_FAF0E6_FILL0_wght400_GRAD0_opsz40.svg",
    },
  ];

  // Intro greeting
  useEffect(() => {
    const intro = `Welcome! Click on options to get started.`;

    // playAvatarResponse(intro).then(() => setIsGreeting(false));
    playAvatarResponse(intro);
  }, []);

  // Play avatar TTS response and update store
  const playAvatarResponse = async (text) => {
    try {
      const res = await fetch("https://kioskagain.onrender.com/texttospeech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setScriptText(data.originalText);
      setAvatarData(data.audio, data.visemes);
    } catch (err) {
      console.error("TTS Error:", err);
    }
  };

  // Handle option selection
  const handleOptionClick = async (option) => {
    setSelectedOption(option.label);
    setMatchedLiquors([]);
    setLiquorInfo(null);
    setRecipe(null);

    // Stop any speaking when changing options
    setAvatarData(null, null);

    if (option.label === "Offers") {
      fetchOffers();
    } else {
      const prompt =
        option.label === "Find Products"
          ? "What product are you looking for?"
          : option.label === "Liquor University"
          ? "Which liquor would you like to know about?"
          : "Tell me what recipe you are looking for.";

      await playAvatarResponse(`${prompt}`);
      setTimeout(() => startListening(option.endpoint), 500);
    }
  };

  // Fetch offers from backend
  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://kioskagain.onrender.com/getoffers");
      const data = await res.json();
      setOffers(data || []);
      setScriptText("Here are the current offers:");
      setAvatarData(null, null); // stop avatar
    } catch (err) {
      console.error("Error fetching offers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Speech recognition
  const startListening = (endpoint) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported.");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    setIsListening(true);
    setShowSpeakAgain(false);

    recognition.onresult = async (event) => {
      const userText = event.results[0][0].transcript;
      setLatestUserText(userText);
      await sendUserQuery(userText, endpoint);
      setIsListening(false);
      setShowSpeakAgain(true);
    };

    recognition.onerror = (err) => {
      console.error("Recognition error:", err);
      setIsListening(false);
      setShowSpeakAgain(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      setShowSpeakAgain(true);
    };

    recognition.start();
    setTimeout(() => {
      if (recognitionRef.current) recognitionRef.current.stop();
    }, 20000);
  };

  // Send user query to backend
  const sendUserQuery = async (text, endpoint) => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://kioskagain.onrender.com${endpoint}`, {
        method: endpoint === "/getoffers" ? "GET" : "POST",
        headers: { "Content-Type": "application/json" },
        body:
          endpoint === "/getoffers"
            ? null
            : JSON.stringify({ text, option: selectedOption, name: text }),
      });
      const data = await res.json();

      // Update UI based on backend response
      if (data.matchedLiquors) setMatchedLiquors(data.matchedLiquors);
      if (data.liquor) setLiquorInfo(data.liquor);
      if (data.recipe) setRecipe(data.recipe);

      if (data.replyText) setScriptText(data.replyText);
      if (data.audio || data.visemes) setAvatarData(data.audio, data.visemes);
    } catch (err) {
      console.error("UserQuery Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakAgain = () => {
    // playAvatarResponse("Sure, I'm listening. What would you like to know?");
    startListening(
      options.find((o) => o.label === selectedOption)?.endpoint || "/userreply"
    );
  };

  const handleBack = () => {
    if (selectedOption) {
      setSelectedOption(null);
      setScriptText("");
      setMatchedLiquors([]);
      setLiquorInfo(null);
      setRecipe(null);
      setShowSpeakAgain(false);
      setAvatarData(null, null);
    } else {
      setAvatarData(null, null);
      navigate("/home");
    }
  };

  return (
    <div className="get-help-container">
      <Navbar />
      <div className="main-content">
        {/* Left Half - Avatar Canvas */}
        <div className="canvas-section">
          <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
            <Experience />
          </Canvas>
        </div>

        {/* Right Half - Options & Content */}
        <div className="right-panel">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>

          {/* Current Conversation */}
          {(scriptText || latestUserText) && (
            <div className="current-script">
              {scriptText && (
                <p>
                  <strong>Assistant:</strong> {scriptText}
                </p>
              )}
              {latestUserText && (
                <p>
                  <strong>You:</strong> {latestUserText}
                </p>
              )}
            </div>
          )}

          {/* Option Buttons */}
          {!selectedOption ? (
            <>
              <h2>Choose an Option</h2>
              {options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleOptionClick(opt)}
                  className="option-button"
                  
                >
                  <div className="svg-container-option">
                    <img
                      src={opt.icon}
                      alt={opt.label}
                      className="animated-svg"
                    />
                  </div>
                  {opt.label}
                </button>
              ))}
            </>
          ) : (
            <>
              <h2>{selectedOption}</h2>

              {/* Listening / Speak Again Controls */}
              <div className="speak-again-controls">
                {isListening && (
                  <p className="listening-text">🎤 Listening...</p>
                )}
                {!isListening && showSpeakAgain && (
                  <button
                    className="speak-again-btn"
                    onClick={handleSpeakAgain}
                  >
                    Speak Again
                  </button>
                )}
              </div>

              {/* Find Products */}
              {matchedLiquors.length > 0 && (
                <div className="liquor-results">
                  <h3>Matched Liquors</h3>
                  <div className="liquor-cards">
                    {matchedLiquors.map((liq) => (
                      <div key={liq.id} className="liquor-card">
                        <h4>{liq.name}</h4>
                        <p>
                          <strong>Category:</strong> {liq.category}
                        </p>
                        <p>
                          <strong>Size:</strong> {liq.Size}
                        </p>
                        {liq.Aisle && (
                          <p>
                            <strong>Aisle:</strong> {liq.Aisle}
                          </p>
                        )}
                        {liq.image && <img src={liq.image} alt={liq.name} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Liquor Info */}
              {liquorInfo && (
                <div className="liquor-info">
                  <h3>{liquorInfo.Name}</h3>
                  <p>
                    <strong>Type:</strong> {liquorInfo.Type}
                  </p>
                  <p>
                    <strong>Alcohol Content:</strong>{" "}
                    {liquorInfo.Alcohol_Content}
                  </p>
                  {liquorInfo.Country && (
                    <p>
                      <strong>Country:</strong> {liquorInfo.Country}
                    </p>
                  )}
                  {liquorInfo.Flavor && (
                    <p>
                      <strong>Flavor:</strong> {liquorInfo.Flavor}
                    </p>
                  )}
                  {liquorInfo.Age && (
                    <p>
                      <strong>Age:</strong> {liquorInfo.Age}
                    </p>
                  )}
                  {liquorInfo.Best_For && (
                    <p>
                      <strong>Best For:</strong> {liquorInfo.Best_For}
                    </p>
                  )}
                </div>
              )}

              {/* Recipe */}
              {recipe && (
                <div className="recipe-card">
                  <h3>Recipe: {recipe.drink}</h3>
                  <h4>Ingredients</h4>
                  <ul>
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx}>
                        {idx + 1}. {ing.amount} {ing.item}
                      </li>
                    ))}
                  </ul>
                  <h4>Instructions</h4>
                  <ol>
                    {recipe.instructions.map((step, idx) => (
                      <li key={idx}>
                        {idx + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Offers in Table Format */}
              {selectedOption === "Offers" && offers.length > 0 && (
                <div className="offers-table-container">
                  <h3>Current Offers</h3>
                  <table className="offers-table">
                    <thead>
                      <tr>
                        <th>Brand</th>
                        <th>Category</th>
                        <th>Size (ml)</th>
                        <th>Flavors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map((offer) => (
                        <tr key={offer.id}>
                          <td>{offer.brand}</td>
                          <td>{offer.category}</td>
                          <td>{offer.size}</td>
                          <td>{offer.flavors || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GetHelp;

// import { Canvas } from "@react-three/fiber";
// import { Experience } from "../../Components/Experience";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../../Components/Navbar/Navbar";
// import FindProducts from "./FindProducts";
// import LiquorInfo from "./LiquorInfo";
// import Offers from "./Offers";
// import Recipe from "./Recipe";
// import { useAvatarStore } from "../../store"; // ✅ Zustand store
// import "./GetHelp.css";

// function GetHelp() {
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [conversation, setConversation] = useState([]);
//   const navigate = useNavigate();
//   const { setAvatarData } = useAvatarStore();

//   const options = [
//     { label: "Find Products", component: <FindProducts /> },
//     { label: "Liquor Information", component: <LiquorInfo /> },
//     { label: "Offers", component: <Offers /> },
//     { label: "Recipes", component: <Recipe /> },
//   ];

//   // 🔊 Fetch welcome message + store audio/visemes
//   useEffect(() => {
//     const introMessage = `Welcome! I’m here to help you with:
//     First. Finding liquor products,
//     Second. Learning about different types of liquor,
//     Third. Viewing current offers, Or
//     Fourth. getting personalized suggestions.
//     Please choose an option to begin!`;

//     const fetchIntro = async () => {
//       try {
//         const res = await fetch("http://localhost:3000/texttospeech", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ text: introMessage }),
//         });
//         const data = await res.json();

//         // Save assistant message in local conversation
//         setConversation((prev) => [
//           ...prev,
//           { role: "assistant", text: data.originalText },
//         ]);

//         // Save avatar data in Zustand store
//         setAvatarData(data.audio, data.visemes);
//       } catch (err) {
//         console.error("Failed to fetch TTS intro:", err);
//       }
//     };

//     fetchIntro();
//   }, [setAvatarData]);

//   const handleBack = () => {
//     if (selectedOption) {
//       setSelectedOption(null);
//       setConversation([]); // reset local conversation
//     } else {
//       navigate("/");
//     }
//   };

//   return (
//     <div className="get-help-container">
//       <Navbar />
//       <div className="main-content">
//         {/* Left Half */}
//         <div className="canvas-section">
//           <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
//             <Experience />
//           </Canvas>
//         </div>

//         {/* Right Half */}
//         <div className="right-panel">
//           <button className="back-button" onClick={handleBack}>
//             ← Back
//           </button>

//           {/* Current Conversation */}
//           {conversation.length > 0 && (
//             <div className="current-script">
//               {conversation.map((c, idx) => (
//                 <p key={idx}>
//                   <strong>
//                     {c.role === "assistant" ? "Assistant" : "You"}:
//                   </strong>{" "}
//                   {c.text}
//                 </p>
//               ))}
//             </div>
//           )}

//           {/* Options or Selected Component */}
//           {!selectedOption ? (
//             <>
//               <h2>Choose an Option</h2>
//               {options.map((opt) => (
//                 <button
//                   key={opt.label}
//                   onClick={() => setSelectedOption(opt.label)}
//                   className="option-button"
//                 >
//                   {opt.label}
//                 </button>
//               ))}
//             </>
//           ) : (
//             <>
//               <h2>{selectedOption}</h2>
//               {options.find((o) => o.label === selectedOption)?.component}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default GetHelp;
// const sendUserQuery = async (text) => {
//     setIsLoading(true);
//     try {
//       const endpoint =
//         selectedOption === "Suggestions" ? "/suggest" : "/userreply";

//       const res = await fetch(`http://localhost:3000${endpoint}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text, option: selectedOption }),
//       });

//       const data = await res.json();

//       setScriptText(data.replyText);
//       setAvatarData(data.audio, data.visemes);
//       setMatchedLiquors(data.matchedLiquors || []);
//       setShowSpeakAgain(true);
//     } catch (err) {
//       console.error("UserQuery Error:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };








