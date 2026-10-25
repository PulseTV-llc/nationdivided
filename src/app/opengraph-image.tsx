import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = "Nation Divided — One Nation. Millions of Stories. A StockHouse Films documentary.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generated social card. Replace with media.socialCard artwork once the key art exists. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(180deg, #08090d 0%, #101827 62%, #08090d 100%)",
          color: "#f3f0ea",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 400,
            height: 2,
            display: "flex",
            background: "linear-gradient(90deg, rgba(167,53,61,0.9), #c9a56a 50%, rgba(65,106,133,0.9))",
          }}
        />
        <div style={{ position: "absolute", left: 599, top: 0, bottom: 0, width: 1, background: "rgba(201,165,106,0.6)", display: "flex" }} />
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 8, color: "#c9a56a", textTransform: "uppercase" }}>
          {`A ${site.studio} documentary`}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 150, fontWeight: 900, lineHeight: 0.86, letterSpacing: -4 }}>
          <span>NATION</span>
          <span style={{ color: "#d9d4ca" }}>DIVIDED</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#d9d4ca" }}>
          <span style={{ fontStyle: "italic" }}>{site.tagline}</span>
          <span style={{ fontSize: 20, letterSpacing: 6, color: "#9b978f" }}>COMING SOON</span>
        </div>
      </div>
    ),
    size,
  );
}
