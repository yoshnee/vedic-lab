/* JsonLd — renders a JSON-LD structured-data block. Server component; drop it
   anywhere in a page's tree. `data` is a schema.org object (or an @graph). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // schema.org payload is our own static data, not user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
