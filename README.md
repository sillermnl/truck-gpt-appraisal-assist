
# LKW-GPT Appraisal Assistant

Eine moderne Webanwendung zur Begutachtung von LKWs mit Hilfe von ChatGPT und Vision-AI für die Analyse von Fahrzeugscheinen.

## Features

- Interaktiver Chat mit GPT-4o Integration
- Bild-Upload-Funktion für Fahrzeugscheine
- Spracherkennung zum Diktieren von Nachrichten
- Strukturierte Datenerfassung gemäß vordefinierten Fragebögen
- Fortschrittsanzeige für den Benutzer
- Responsives Design mit modernem UI

## Installation

1. Klonen Sie das Repository:
```bash
git clone https://github.com/yourusername/truck-gpt-appraisal-assist.git
cd truck-gpt-appraisal-assist
```

2. Installieren Sie die Abhängigkeiten:
```bash
npm install
```

3. Starten Sie die Anwendung:
```bash
npm run dev
```

## Deployment auf Railway

1. Forken Sie das Repository auf GitHub
2. Verbinden Sie Ihr Railway-Konto mit GitHub
3. Erstellen Sie ein neues Projekt in Railway und wählen Sie das Repository aus
4. Fügen Sie die erforderlichen Umgebungsvariablen hinzu (falls benötigt)
5. Starten Sie den Deployment-Prozess

## Verwendung

1. Öffnen Sie die App in Ihrem Browser
2. Geben Sie Ihren OpenAI API-Schlüssel ein
3. Beginnen Sie ein Gespräch mit dem KI-Assistenten
4. Laden Sie bei Bedarf Bilder von Fahrzeugdokumenten hoch
5. Nutzen Sie die Spracherkennung für eine handfreie Bedienung
6. Der Assistent führt Sie durch den strukturierten Fragebogen zur Fahrzeugbewertung
7. Nach Abschluss erhalten Sie die Daten im erforderlichen Format

## API-Schlüssel

Sie benötigen einen gültigen OpenAI API-Schlüssel mit Zugriff auf das GPT-4o Modell, um die Anwendung nutzen zu können. Der API-Schlüssel wird lokal in Ihrem Browser gespeichert und nicht an einen Server übertragen.

## Technologie-Stack

- React mit TypeScript
- Tailwind CSS für das Styling
- shadcn/ui für UI-Komponenten
- OpenAI API für die KI-Integration
- Web Speech API für Spracherkennung

## Lizenz

MIT
