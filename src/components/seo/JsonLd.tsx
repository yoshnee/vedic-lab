/* JsonLd — renders a JSON-LD structured-data block. Server component; drop it
   anywhere in a page's tree. `data` is a schema.org object (or an @graph). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // schema.org payload is our own static data, but escape "<" defensively so a
      // future "</script>" substring can't break out of the tag (JSON.stringify
      // does not escape it). Standard JSON-LD hardening.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
