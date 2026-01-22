export default function Head() {
  const APP_URL = "https://mine-ronin2001.vercel.app";
  const IMAGE_URL = `${APP_URL}/head-base.png`;

  return (
    <>
      <title>Mine Ronin</title>

      <meta property="og:title" content="Mine Ronin" />
      <meta property="og:description" content="Minesweeper on Base" />
      <meta property="og:image" content={IMAGE_URL} />

      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content={IMAGE_URL} />
      <meta property="fc:frame:button:1" content="Play" />
      <meta property="fc:frame:button:1:action" content="launch_miniapp" />
      <meta property="fc:frame:button:1:target" content={APP_URL} />
    </>
  );
}
