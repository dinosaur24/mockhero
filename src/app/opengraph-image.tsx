import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MockHero — Synthetic Test Data API";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a12",
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(67, 56, 202, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(67, 56, 202, 0.1) 0%, transparent 50%)",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot grid background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Code snippet decoration - left */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 60,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            opacity: 0.3,
            fontSize: 14,
            color: "#a5b4fc",
          }}
        >
          <span>{`{`}</span>
          <span>{`  "schema": [{`}</span>
          <span>{`    "name": "users",`}</span>
          <span>{`    "count": 1000,`}</span>
          <span>{`    "fields": [`}</span>
          <span>{`      { "name": "id" },`}</span>
          <span>{`      { "name": "email" }`}</span>
          <span>{`    ]`}</span>
          <span>{`  }]`}</span>
          <span>{`}`}</span>
        </div>

        {/* Code snippet decoration - right */}
        <div
          style={{
            position: "absolute",
            bottom: 80,
            right: 60,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            opacity: 0.3,
            fontSize: 14,
            color: "#a5b4fc",
          }}
        >
          <span>{`// Response`}</span>
          <span>{`{`}</span>
          <span>{`  "users": [`}</span>
          <span>{`    { "id": 1,`}</span>
          <span>{`      "email": "sarah@..." },`}</span>
          <span>{`    { "id": 2,`}</span>
          <span>{`      "email": "yuki@..." }`}</span>
          <span>{`  ]`}</span>
          <span>{`}`}</span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: "#4338CA",
              marginBottom: 32,
              fontSize: 40,
              color: "white",
              fontWeight: 700,
            }}
          >
            M
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            MockHero
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#a5b4fc",
              letterSpacing: "0.05em",
              marginBottom: 40,
            }}
          >
            Synthetic Test Data API
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            {["150+ Field Types", "JSON · CSV · SQL", "22 Locales"].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    padding: "10px 24px",
                    borderRadius: 999,
                    border: "1px solid rgba(165, 180, 252, 0.2)",
                    backgroundColor: "rgba(67, 56, 202, 0.1)",
                    color: "#c7d2fe",
                    fontSize: 18,
                  }}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            display: "flex",
            fontSize: 18,
            color: "rgba(165, 180, 252, 0.5)",
            letterSpacing: "0.1em",
          }}
        >
          mockhero.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
