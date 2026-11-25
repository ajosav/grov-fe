export const meta = () => [{title: 'Page not found'}];

export default function NotFound() {
  return (
    <main
      className="wrap"
      style={{minHeight: '70vh', display: 'grid', placeContent: 'center', gap: '16px'}}
    >
      <h1>We can’t find that page.</h1>
      <p className="lead">
        <a href="/">Go to the home page</a>
      </p>
    </main>
  );
}
