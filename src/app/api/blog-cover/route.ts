import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createElement as h } from "react";

export const runtime = "edge";

const palettes: Record<string, { bg: string; glow: string; accent: string; accent2: string }> = {
  "Fragrance Tips": { bg: "#fff7f1", glow: "#f7c5d8", accent: "#8e345f", accent2: "#d79a62" },
  "Gift Guides": { bg: "#fff7ed", glow: "#f7d69d", accent: "#8a4b30", accent2: "#c84f7e" },
  "Beauty Notes": { bg: "#f7f3ff", glow: "#d9c8ff", accent: "#684596", accent2: "#d45f8f" },
};

export async function GET(request: NextRequest) {
  const title = (request.nextUrl.searchParams.get("title") || "The JIS Journal").slice(0, 140);
  const category = (request.nextUrl.searchParams.get("category") || "Beauty Notes").slice(0, 80);
  const palette = palettes[category] || { bg: "#fff7f3", glow: "#f3c8db", accent: "#7e1f50", accent2: "#c78d5e" };

  const rootStyle = {
    width: "1200px",
    height: "675px",
    display: "flex",
    position: "relative" as const,
    overflow: "hidden",
    background: `linear-gradient(135deg, ${palette.bg} 0%, #fff 46%, ${palette.glow} 100%)`,
    color: "#28111f",
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  return new ImageResponse(
    h(
      "div",
      { style: rootStyle },
      h("div", {
        style: {
          position: "absolute",
          width: "430px",
          height: "430px",
          borderRadius: "999px",
          right: "-90px",
          top: "-115px",
          background: palette.glow,
          opacity: 0.72,
        },
      }),
      h("div", {
        style: {
          position: "absolute",
          width: "330px",
          height: "330px",
          borderRadius: "999px",
          left: "-110px",
          bottom: "-125px",
          background: palette.accent2,
          opacity: 0.17,
        },
      }),
      h(
        "div",
        {
          style: {
            display: "flex",
            position: "absolute",
            right: "95px",
            bottom: "72px",
            width: "245px",
            height: "360px",
            alignItems: "flex-end",
            justifyContent: "center",
          },
        },
        h("div", {
          style: {
            position: "absolute",
            width: "92px",
            height: "58px",
            top: "4px",
            borderRadius: "14px 14px 6px 6px",
            background: "#28111f",
            opacity: 0.9,
          },
        }),
        h("div", {
          style: {
            position: "absolute",
            width: "138px",
            height: "42px",
            top: "52px",
            borderRadius: "10px 10px 3px 3px",
            background: palette.accent2,
            opacity: 0.82,
          },
        }),
        h("div", {
          style: {
            width: "218px",
            height: "278px",
            borderRadius: "38px 38px 54px 54px",
            border: "3px solid rgba(40,17,31,.18)",
            background: "rgba(255,255,255,.58)",
            boxShadow: "0 28px 70px rgba(76,28,55,.16)",
          },
        })
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            width: "760px",
            padding: "78px 0 68px 82px",
            justifyContent: "space-between",
          },
        },
        h(
          "div",
          { style: { display: "flex", flexDirection: "column" } },
          h("div", {
            style: {
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: palette.accent,
            },
          }, "JIS BEAUTY & FASHION"),
          h("div", {
            style: {
              marginTop: "42px",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#7c6472",
            },
          }, category),
          h("div", {
            style: {
              marginTop: "20px",
              fontSize: title.length > 85 ? "54px" : "64px",
              lineHeight: 1.02,
              letterSpacing: "-2px",
              fontWeight: 700,
              maxWidth: "735px",
              color: "#28111f",
            },
          }, title)
        ),
        h("div", {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "18px",
            letterSpacing: "2px",
            color: "#7c6472",
          },
        },
          h("div", { style: { width: "54px", height: "3px", background: palette.accent } }),
          "THE JIS JOURNAL"
        )
      )
    ),
    { width: 1200, height: 675 }
  );
}
