const HEADER_RECIPIENT = "x-appspnd-recipient";
const HEADER_SENDER = "x-appspnd-sender";
const HEADER_SUBJECT = "x-appspnd-subject";

export default {
  async email(message, env) {
    const response = await fetch(env.FIREBASE_INGEST_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.INGEST_SHARED_SECRET}`,
        "content-type": "message/rfc822",
        [HEADER_RECIPIENT]: message.to,
        [HEADER_SENDER]: message.from,
        [HEADER_SUBJECT]: message.headers.get("subject") ?? "",
      },
      body: message.raw,
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(
        JSON.stringify({
          event: "email_ingest_failed",
          status: response.status,
          statusText: response.statusText,
          responseText: responseText.slice(0, 500),
          recipient: message.to,
        }),
      );
      message.setReject(`AppSpnd ingest failed with ${response.status}`);
      return;
    }

    console.log(
      JSON.stringify({
        event: "email_ingested",
        recipient: message.to,
        sender: message.from,
      }),
    );
  },
} satisfies ExportedHandler<Env>;
