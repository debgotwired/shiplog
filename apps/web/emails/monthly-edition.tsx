import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import type { Entry } from "@shiplog/shared";

export function MonthlyEditionEmail({ entries, intro = "A concise edition of what shipped this month." }: { entries: Entry[]; intro?: string }) {
  return (
    <Html>
      <Head />
      <Preview>New product updates from Shiplog</Preview>
      <Body style={{ background: "#f8f7f2", color: "#171717", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ background: "#fffdf8", border: "1px solid #dedbd1", padding: 24 }}>
          <Heading>Monthly product edition</Heading>
          <Text>{intro}</Text>
          {entries.map((entry) => <Section key={entry.id} style={{ borderTop: "1px solid #dedbd1", paddingTop: 16 }}><Heading as="h2">{entry.title}</Heading><Text>{entry.summary}</Text>{entry.ctaUrl ? <Button href={entry.ctaUrl} style={{ background: "#171717", color: "#f8f7f2", padding: "10px 14px" }}>{entry.ctaLabel ?? "Take me there"}</Button> : null}</Section>)}
          <Text style={{ color: "#666" }}>Preference center: all updates, weekly, monthly, categories only, unsubscribe.</Text>
        </Container>
      </Body>
    </Html>
  );
}
