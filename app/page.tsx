export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">Calendar Event Notifications</h1>
        <p className="text-muted-foreground">
          Keep the app open to receive notifications when your calendar events are due.
        </p>
      </div>
    </main>
  );
}
