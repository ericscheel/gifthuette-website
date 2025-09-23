import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { FileText, ArrowLeft } from 'lucide-react';

interface ImprintPageProps {
  setCurrentPage: (page: string) => void;
}

export function ImprintPage({ setCurrentPage }: ImprintPageProps) {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button 
          variant="outline" 
          onClick={() => setCurrentPage('contact')}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Kontakt
        </Button>

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold mb-4">
            <FileText className="inline h-10 w-10 mr-4 text-primary" />
            <span className="text-primary">Impressum</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Angaben gemäß § 5 TMG
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-card wood-texture border-primary/20">
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">Angaben gemäß § 5 TMG</h2>
                <div className="bg-secondary/30 p-6 rounded-lg">
                  <p className="mb-2"><strong>Gifthütte Mobile Bar</strong></p>
                  <p className="mb-2">Max Mustermann</p>
                  <p className="mb-2">Musterstraße 123</p>
                  <p className="mb-4">12345 Musterstadt</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold mb-1">Kontakt:</p>
                      <p>Telefon: +49 (0) 123 456 789</p>
                      <p>E-Mail: info@gifthuette.de</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Geschäftszeiten:</p>
                      <p>Nach Vereinbarung</p>
                      <p>Event-abhängig</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">Umsatzsteuer-ID</h2>
                <p className="text-muted-foreground mb-4">
                  Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
                </p>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p><strong>DE123456789</strong></p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">Wirtschafts-ID</h2>
                <p className="text-muted-foreground mb-4">
                  Wirtschafts-Identifikationsnummer gemäß § 139c AO:
                </p>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p><strong>12345678901</strong></p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">Berufsbezeichnung</h2>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p><strong>Mobile Gastronomie / Schausteller</strong></p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Gewerbeanmeldung bei der Stadt Musterstadt
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">EU-Streitschlichtung</h2>
                <p className="text-muted-foreground mb-4">
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                </p>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p><a href="https://ec.europa.eu/consumers/odr/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    https://ec.europa.eu/consumers/odr/
                  </a></p>
                </div>
                <p className="text-muted-foreground mt-4">
                  Unsere E-Mail-Adresse finden Sie oben im Impressum.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">Verbraucherstreitbeilegung</h2>
                <p className="text-muted-foreground">
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                  Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">Haftung für Inhalte</h2>
                <p className="text-muted-foreground mb-4">
                  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                  nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
                  Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte 
                  fremde Informationen zu überwachen.
                </p>
                <p className="text-muted-foreground">
                  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den 
                  allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch 
                  erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">Haftung für Links</h2>
                <p className="text-muted-foreground mb-4">
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
                  Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                  Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber 
                  der Seiten verantwortlich.
                </p>
                <p className="text-muted-foreground">
                  Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße 
                  überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">Urheberrecht</h2>
                <p className="text-muted-foreground mb-4">
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                  dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
                  der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
                  Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
                <p className="text-muted-foreground">
                  Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen 
                  Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt 
                  wurden, werden die Urheberrechte Dritter beachtet.
                </p>
              </section>

              <div className="bg-primary/10 p-6 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Quelle:</strong> erstellt mit dem Impressum-Generator der 
                  <a href="https://www.kanzlei-hasselbach.de/" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                    Kanzlei Hasselbach, Rechtsanwälte für Arbeitsrecht und Familienrecht
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}