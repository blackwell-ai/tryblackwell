import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

async function loadLibreBaskervilleBold() {
  const css = await (
    await fetch(
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&text=B"
    )
  ).text()

  const fontUrl = css.match(/src: url\(([^)]+)\)/)?.[1]
  if (!fontUrl) throw new Error("Could not resolve Libre Baskerville font URL")

  const fontData = await (await fetch(fontUrl)).arrayBuffer()
  return fontData
}

export default async function Icon() {
  const fontData = await loadLibreBaskervilleBold()

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#010101",
          color: "#f8f8f8",
          fontFamily: "Libre Baskerville",
          fontWeight: 700,
          fontSize: 22,
        }}
      >
        B
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Libre Baskerville",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    }
  )
}
