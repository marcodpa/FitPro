import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{
          __html: `
            *, *::before, *::after { box-sizing: border-box; }
            html, body, #root {
              width: 100%;
              height: 100%;
              min-height: 100dvh;
              margin: 0;
              padding: 0;
              overflow: hidden;
              background: #080808;
            }
            #root {
              display: flex;
              flex-direction: column;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
