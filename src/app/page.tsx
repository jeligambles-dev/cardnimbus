export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-6">
      <div className="text-center animate-[fadeIn_0.6s_ease-out]">
        <h1 className="text-6xl font-bold tracking-tight text-text-primary sm:text-8xl">
          Card{" "}
          <span className="text-nimbus-500">Nimbus</span>
        </h1>
        <p className="mt-6 text-xl text-text-secondary">
          The boldest Pokemon card marketplace in the hobby.
        </p>
        <p className="mt-3 text-sm text-text-muted font-mono">
          Coming soon — setting up the stack.
        </p>
      </div>
    </main>
  );
}
