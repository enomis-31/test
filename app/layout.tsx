import React from 'react';
import NotificationManager from './components/notifications/NotificationManager';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NotificationManager />
        {children}
      </body>
    </html>
  );
}
