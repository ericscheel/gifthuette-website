import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  setCurrentPage: (page: string) => void;
}

export function PrivacyPage({ setCurrentPage }: PrivacyPageProps) {
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
            <Shield className="inline h-10 w-10 mr-4 text-primary" />
            Datenschutz<span className="text-primary">erklärung</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Ihr Datenschutz ist uns wichtig
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
                <h2 className="text-2xl font-bold mb-4 text-primary">1. Verantwortlicher</h2>
                <p className="text-muted-foreground mb-4">
                  Verantwortlich für die Datenverarbeitung auf dieser Website ist:
                </p>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p><strong>Gifthütte Mobile Bar</strong></p>
                  <p>Max Mustermann</p>
                  <p>Musterstraße 123</p>
                  <p>12345 Musterstadt</p>
                  <p>E-Mail: info@gifthuette.de</p>
                  <p>Telefon: +49 (0) 123 456 789</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">2. Erhebung und Speicherung personenbezogener Daten</h2>
                <h3 className="text-lg font-semibold mb-2">Beim Besuch der Website</h3>
                <p className="text-muted-foreground mb-4">
                  Beim Aufruf unserer Website werden durch den auf Ihrem Endgerät zum Einsatz kommenden Browser 
                  automatisch Informationen an den Server unserer Website gesendet. Diese Informationen werden 
                  temporär in einem sog. Logfile gespeichert.
                </p>
                <p className="text-muted-foreground mb-4">Folgende Informationen werden dabei erfasst:</p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                  <li>IP-Adresse des anfragenden Rechners</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>Name und URL der abgerufenen Datei</li>
                  <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
                  <li>Verwendeter Browser und ggf. das Betriebssystem</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">3. Kontaktformular und E-Mail-Kontakt</h2>
                <p className="text-muted-foreground mb-4">
                  Auf unserer Website ist ein Kontaktformular vorhanden, welches für die elektronische 
                  Kontaktaufnahme genutzt werden kann. Nimmt ein Nutzer diese Möglichkeit wahr, so werden 
                  die in der Eingabemaske eingegeben Daten an uns übermittelt und gespeichert.
                </p>
                <p className="text-muted-foreground mb-4">Diese Daten sind:</p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                  <li>Name</li>
                  <li>E-Mail-Adresse</li>
                  <li>Telefonnummer (optional)</li>
                  <li>Art der Veranstaltung</li>
                  <li>Gewünschtes Datum</li>
                  <li>Nachrichtentext</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">4. Newsletter</h2>
                <p className="text-muted-foreground mb-4">
                  Mit Ihrer Einwilligung können Sie unseren Newsletter abonnieren, mit dem wir Sie über 
                  unsere aktuellen Events, neue Getränke und Gewinnspiele informieren.
                </p>
                <p className="text-muted-foreground mb-4">
                  Für die Anmeldung verwenden wir das sog. Double-Opt-in-Verfahren. Das heißt, dass wir 
                  Ihnen nach Ihrer Anmeldung eine E-Mail an die angegebene E-Mail-Adresse senden, in 
                  welcher wir Sie um Bestätigung bitten.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">5. Weitergabe von Daten</h2>
                <p className="text-muted-foreground mb-4">
                  Eine Übermittlung Ihrer persönlichen Daten an Dritte zu anderen als den im Folgenden 
                  aufgeführten Zwecken findet nicht statt. Wir geben Ihre persönlichen Daten nur an 
                  Dritte weiter, wenn:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                  <li>Sie Ihre ausdrückliche Einwilligung dazu erteilt haben</li>
                  <li>die Weitergabe zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich ist</li>
                  <li>eine gesetzliche Verpflichtung zur Weitergabe besteht</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">6. Ihre Rechte</h2>
                <p className="text-muted-foreground mb-4">
                  Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                  <li>Recht auf Auskunft</li>
                  <li>Recht auf Berichtigung oder Löschung</li>
                  <li>Recht auf Einschränkung der Verarbeitung</li>
                  <li>Recht auf Widerspruch gegen die Verarbeitung</li>
                  <li>Recht auf Datenübertragbarkeit</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">7. Speicherdauer</h2>
                <p className="text-muted-foreground mb-4">
                  Wir speichern personenbezogene Daten nur so lange, wie dies für die Erfüllung der 
                  verfolgten Zwecke erforderlich ist oder sofern dies durch gesetzliche Aufbewahrungsfristen 
                  vorgeschrieben ist.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">8. SSL-Verschlüsselung</h2>
                <p className="text-muted-foreground mb-4">
                  Diese Seite nutzt aus Gründen der Sicherheit und zum Schutz der Übertragung vertraulicher 
                  Inhalte eine SSL-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, 
                  dass die Adresszeile des Browsers von "http://" auf "https://" wechselt.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">9. Änderung der Datenschutzerklärung</h2>
                <p className="text-muted-foreground mb-4">
                  Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den 
                  aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen 
                  in der Datenschutzerklärung umzusetzen.
                </p>
              </section>

              <div className="bg-primary/10 p-6 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Stand:</strong> September 2025<br/>
                  Bei Fragen zum Datenschutz kontaktieren Sie uns unter: info@gifthuette.de
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}