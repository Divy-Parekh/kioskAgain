import { useState, useEffect } from "react";
import { useAvatarStore } from "../../store"; // ✅ Zustand store
import "./Offers.css";

function Offers() {
  const [offers, setOffers] = useState([]);
  const [sortBy, setSortBy] = useState("price");
  const { setAvatarData } = useAvatarStore();

  useEffect(() => {
    // 🛑 Stop avatar speaking when entering Offers page
    // setAvatarData(null, null);

    const fetchOffers = async () => {
      try {
        const res = await fetch("http://localhost:3000/getoffers");
        const data = await res.json();
        setOffers(data.offers || []);
      } catch (err) {
        console.error("Error fetching offers:", err);
      }
    };

    fetchOffers();
  }, []);

  const sortedOffers = [...offers].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "discount") return b.discount - a.discount;
    return 0;
  });

  return (
    <div className="offers-container">
      <label>Sort by:</label>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="price">Price</option>
        <option value="discount">Discount</option>
      </select>

      <div className="liquor-cards">
        {sortedOffers.length > 0 ? (
          sortedOffers.map((offer, idx) => (
            <div key={idx} className="liquor-card">
              <h4>{offer.name}</h4>
              <p>Price: ${offer.price}</p>
              <p>Discount: {offer.discount}%</p>
            </div>
          ))
        ) : (
          <p>No offers available.</p>
        )}
      </div>
    </div>
  );
}

export default Offers;
