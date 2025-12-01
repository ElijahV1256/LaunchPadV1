import { useState } from "react";
import { generateNanoDesign } from "../nanoBanana";

export default function NanoGenerator() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateFlyer() {
    setLoading(true);
    const result = await generateNanoDesign(
      "clean modern flyer for a local business using brand guide colors",
      "flyer"
    );
    setImageUrl(result.imageUrl);
    setLoading(false);
  }

  async function generateWebsite() {
    setLoading(true);
    const result = await generateNanoDesign(
      "simple modern website homepage design for a small business",
      "website"
    );
    setImageUrl(result.imageUrl);
    setLoading(false);
  }

  return (
    <div>
      <h2>NanoBanana AI Generator</h2>

      <button onClick={generateFlyer}>Generate Flyer</button>
      <button onClick={generateWebsite}>Generate Website Design</button>

      {loading && <p>Generating...</p>}

      {imageUrl && (
        <img
          src={imageUrl}
          alt='Generated Design'
          style={{ width: "300px", marginTop: "20px" }}
        />
      )}
    </div>
  );
}
