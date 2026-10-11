import { useState } from "react";
import { Quiz, type QuizItem } from "./netSecShared";

// A practice inbox: decide which messages are phishing, then see the red flags. All senders,
// domains and people are made up for the exercise.

interface Mail {
  id: string;
  fromName: string;
  fromAddr: string;
  subject: string;
  body: string;
  linkText?: string;
  linkHref?: string;
  phish: boolean;
  flags: string[];
}

const MAILS: Mail[] = [
  {
    id: "mailbox",
    fromName: "IT Service Desk",
    fromAddr: "it-support@conperio-helpdesk.example",
    subject: "ACTION REQUIRED: mailbox over quota, verify within 24 hours",
    body: "Your mailbox has exceeded its storage limit. Incoming mail will be deleted unless you verify your account within 24 hours.",
    linkText: "https://portal.conperio.com/verify",
    linkHref: "https://conperio-login.mail-verify.example/verify?u=ava",
    phish: true,
    flags: [
      "The sender's domain is conperio-helpdesk.example, not conperio.com. Anyone can register a lookalike domain.",
      "The link text shows a real-looking address, but the actual target is a different site.",
      "Urgency and a threat (mail will be deleted) to rush you.",
      "IT never needs you to \"verify\" your password through a link.",
    ],
  },
  {
    id: "timesheet",
    fromName: "Payroll",
    fromAddr: "payroll@conperio.com",
    subject: "Reminder: timesheets due Friday",
    body: "A reminder that October timesheets are due by Friday at 15:00. Submit them in the HR system as usual. Questions? Reply to this email or call extension 2210.",
    phish: false,
    flags: ["Internal domain, expected and routine, no link to log in through, and it tells you to use the system you already know."],
  },
  {
    id: "ceo",
    fromName: "Marta Jensen (CEO)",
    fromAddr: "marta.jensen.office@freemail.example",
    subject: "Quick favour, are you at your desk?",
    body: "I'm in meetings all afternoon. I need you to buy six €200 gift cards for a client today and send me the codes. Keep this between us for now, it's a surprise.",
    phish: true,
    flags: [
      "A senior name on a free email address.",
      "Gift cards, secrecy and time pressure: the classic CEO fraud (business email compromise) script.",
      "Verify through a known channel: call the person on the number in the company directory, not one in the email.",
    ],
  },
  {
    id: "invoice",
    fromName: "Northwind Supplies Accounts",
    fromAddr: "accounts@northwind-supp1ies.example",
    subject: "Updated bank details for invoice 88213",
    body: "Please note our bank account has changed due to an audit. Kindly pay invoice 88213 (€48,750.00) to the new account below from today. Our previous account is no longer in use.",
    phish: true,
    flags: [
      "supp1ies with the digit 1 instead of the letter l.",
      "A change of bank details by email is the most expensive fraud companies see. Always confirm by phone using the number on file, never the one in the message.",
    ],
  },
  {
    id: "share",
    fromName: "Ben via FileShare",
    fromAddr: "no-reply@share-docs-notify.example",
    subject: "Ben shared \"Q3 bonus list.xlsx\" with you",
    body: "Ben has shared a file with you. Sign in with your work account to view it.",
    linkText: "Open document",
    linkHref: "https://share-docs-notify.example/login?continue=bonus.xlsx",
    phish: true,
    flags: [
      "A tempting file name (bonus list) to get a click.",
      "The sign-in page is on an unknown domain. Your company's real sign-in page has a fixed address; check it before typing anything.",
      "If in doubt, ask Ben in Teams or by phone whether he shared it.",
    ],
  },
  {
    id: "academy",
    fromName: "Conperio Academy",
    fromAddr: "academy@conperio.com",
    subject: "3 lessons are due for review",
    body: "Spaced repetition says three lessons you solved are due for another look today.",
    linkText: "Open the dashboard",
    linkHref: "https://academy.conperio.com/",
    phish: false,
    flags: ["Internal sender, expected kind of message, the link goes where it says, and it doesn't ask for credentials."],
  },
  {
    id: "parcel",
    fromName: "Parcel Delivery",
    fromAddr: "notice@parcel-redelivery.example",
    subject: "Your parcel is held: customs fee €1.99",
    body: "We tried to deliver your parcel. A customs fee of €1.99 is outstanding. Pay within 48 hours or it will be returned.",
    linkText: "Pay €1.99",
    linkHref: "https://parcel-redelivery.example/pay",
    phish: true,
    flags: [
      "A tiny fee lowers your guard; the real goal is your card details.",
      "Were you even expecting a parcel? Check on the courier's own site by typing its address yourself.",
    ],
  },
  {
    id: "invite",
    fromName: "Jonas Berg",
    fromAddr: "jonas.berg@conperio.com",
    subject: "Invitation: Line 3 commissioning review, Tue 10:00",
    body: "Calendar invite for Tuesday 10:00 in meeting room B. Agenda: punch list, I/O check results, handover date.",
    phish: false,
    flags: ["A colleague's internal address, a specific and plausible meeting, no link to sign in through, nothing urgent."],
  },
];

const QUIZ: QuizItem[] = [
  {
    q: "You clicked a link and typed your password into a page that now looks wrong. What first?",
    options: ["Wait and see", "Change the password right away from the real site, and report it to IT straight away", "Delete the email so no one knows"],
    answer: 1,
    why: "Minutes matter: attackers use stolen credentials fast. Reporting quickly lets IT revoke sessions and look for other people who got the same email. Nobody gets in trouble for reporting.",
  },
  {
    q: "Someone in a hi-vis vest with a ladder asks you to hold the badge door for them. Polite refusal?",
    options: ["Let them in; they're clearly a contractor", "Ask them to badge in or go to reception, where visitors are signed in and escorted", "Ignore them"],
    answer: 1,
    why: "Tailgating works because people are helpful. Reception exists exactly so you don't have to judge who's genuine.",
  },
  {
    q: "A caller says they're from IT and need your MFA code to fix your account. What's going on?",
    options: ["Routine support", "Social engineering by phone (vishing). IT never needs your MFA code or password.", "A system test"],
    answer: 1,
    why: "Hang up and call the service desk on the number you already know. A code you read out lets them sign in as you.",
  },
  {
    q: "You find a USB stick labelled \"Salaries 2026\" in the car park. What do you do?",
    options: ["Plug it in to find the owner", "Hand it to IT or security without plugging it in", "Plug it into a plant PC, which isn't on the office network"],
    answer: 1,
    why: "Dropped USB sticks are a real attack, and plant PCs are the worst place to plug one in: Stuxnet reached its air-gapped target on removable media.",
  },
];

export function PhishingSocial() {
  const [verdicts, setVerdicts] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>("mailbox");
  const [hover, setHover] = useState<string | null>(null);
  const answered = Object.keys(verdicts).length;
  const right = MAILS.filter((m) => verdicts[m.id] !== undefined && verdicts[m.id] === m.phish).length;
  const mail = MAILS.find((m) => m.id === openId);

  return (
    <div className="tool-widget">
      <p className="gate-note">
        Open each message and decide: phishing or genuine? Tap or hover over a link to see where it really goes (in a real mail client, hover on a computer or
        long-press on a phone). {answered > 0 && `${right} of ${answered} right so far.`}
      </p>
      <div className="ns-inbox">
        <ul className="ns-inbox-list">
          {MAILS.map((m) => {
            const v = verdicts[m.id];
            const mark = v === undefined ? "" : v === m.phish ? "✓" : "✗";
            return (
              <li key={m.id}>
                <button className={`ns-inbox-item ${m.id === openId ? "active" : ""}`} onClick={() => setOpenId(m.id)}>
                  <span className="ns-inbox-from">
                    {m.fromName} {mark && <span className={v === m.phish ? "constraint-ok" : "constraint-fail"}>{mark}</span>}
                  </span>
                  <span className="ns-small">{m.subject}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {mail && (
          <div className="ns-mail">
            <p className="ns-small">
              <strong>From:</strong> {mail.fromName} <span className="mono">&lt;{mail.fromAddr}&gt;</span>
            </p>
            <p className="ns-small">
              <strong>Subject:</strong> {mail.subject}
            </p>
            <p>{mail.body}</p>
            {mail.linkText && (
              <p>
                <button
                  className="link-button"
                  onMouseEnter={() => setHover(mail.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(mail.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => setHover(hover === mail.id ? null : mail.id)}
                >
                  {mail.linkText}
                </button>
                {hover === mail.id && <span className="mono ns-small ns-link-target"> really goes to {mail.linkHref}</span>}
              </p>
            )}
            <div className="darr-actions">
              <button className={verdicts[mail.id] === true ? "active" : ""} onClick={() => setVerdicts({ ...verdicts, [mail.id]: true })}>
                Phishing: report it
              </button>
              <button className={verdicts[mail.id] === false ? "active" : ""} onClick={() => setVerdicts({ ...verdicts, [mail.id]: false })}>
                Looks genuine
              </button>
            </div>
            {verdicts[mail.id] !== undefined && (
              <div className="drill-feedback">
                <p className={verdicts[mail.id] === mail.phish ? "constraint-ok" : "constraint-fail"}>
                  {verdicts[mail.id] === mail.phish ? "Right" : "Not quite"}: {mail.phish ? "this is phishing." : "this one is genuine."}
                </p>
                <ul>
                  {mail.flags.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="crypto-section">
        <h3>Beyond email</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Technique</th>
                <th>What it looks like</th>
                <th>What to do</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vishing (voice)</td>
                <td>&quot;IT&quot; or &quot;the bank&quot; calls and needs a code or a remote session</td>
                <td>Hang up, call back on a number you already know</td>
              </tr>
              <tr>
                <td>Smishing (SMS)</td>
                <td>Parcel, bank or toll texts with a link</td>
                <td>Don&apos;t tap; go to the service&apos;s site or app yourself</td>
              </tr>
              <tr>
                <td>Pretexting</td>
                <td>A believable story (an auditor, a new starter, a vendor) to get information</td>
                <td>Verify identity through a separate channel before sharing</td>
              </tr>
              <tr>
                <td>Tailgating</td>
                <td>Following someone through a badge door</td>
                <td>Point them to reception</td>
              </tr>
              <tr>
                <td>MFA fatigue</td>
                <td>Repeated sign-in approval prompts you didn&apos;t start</td>
                <td>Deny, report, change your password</td>
              </tr>
              <tr>
                <td>Baiting</td>
                <td>Free USB sticks, &quot;found&quot; drives, QR codes stuck over real ones</td>
                <td>Hand drives to IT; check where a QR code leads before acting</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Quiz items={QUIZ} title="Check yourself" />
    </div>
  );
}
