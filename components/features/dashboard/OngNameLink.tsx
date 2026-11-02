/**
 * The organization's name as a link to its profile, opened in a new tab so the
 * filtered list stays where it was — the same link Gestionează programul uses.
 */
export function OngNameLink({ ong }: { ong: { documentId: string; name: string } }) {
  return (
    <a
      href={`/dashboard/organizatii/${ong.documentId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1c81]/40"
    >
      {ong.name}
      <span className="sr-only"> (se deschide într-un tab nou)</span>
    </a>
  );
}
