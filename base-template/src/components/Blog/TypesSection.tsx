export default function TypesSection() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Arten von Wärmepumpen</h2>
      <div className="space-y-4 text-gray-dark">
        <p>
          <strong>Luft-Wasser-Wärmepumpe</strong> – einfache Installation, ideal
          für Einfamilienhäuser.
        </p>
        <p>
          <strong>Erdwärmepumpe</strong> – effizient, benötigt jedoch
          Erdarbeiten oder Sonden.
        </p>
        <p>
          <strong>Wasser-Wasser-Wärmepumpe</strong> – nutzt Grundwasser, aber
          genehmigungspflichtig.
        </p>

        {/* Platzhalter für Diagramm */}
        {/* <Image src="/img/articles/types-diagram.jpg" alt="Wärmepumpenarten" width={800} height={400} className="rounded-xl mx-auto" /> */}
      </div>
    </section>
  );
}
