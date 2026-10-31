const pages = {
    about: {
        title: "About Alien.ai",
        lead: "A creative workspace for turning ideas, scripts, and stories into video concepts.",
        sections: [
            { title: "What we are building", text: "Alien.ai brings story planning, visual styles, and video-creation tools together in one place. The website is designed to make it easier to explore an idea and shape it into a creative brief." },
            { title: "Current product status", text: "This website is an early product preview. Demo login stores a username in the browser only; it does not verify identities or passwords. The video-generation provider, payments, and mobile apps are not connected yet, so the current dashboard does not produce finished AI videos." },
            { title: "Our approach", text: "We aim to make creative tools approachable, explain what is and is not available, and give creators a clear place to develop their next idea." }
        ]
    },
    pricing: {
        title: "Pricing",
        lead: "Clear pricing will be published here when plans and billing are ready.",
        notice: "No paid plans, prices, or checkout are currently configured. The website is a preview; no purchase can be made through it.",
        plans: [
            { title: "Website preview", text: "Explore the product pages and dashboard preview. AI generation and paid account features are not connected." },
            { title: "Paid plans", text: "Not available yet. Plan names, prices, billing periods, taxes, and cancellation terms have not been set." },
            { title: "Billing questions", text: "There is no payment processor connected to this preview. Add a verified support contact before accepting payments." }
        ],
        sections: [
            { title: "Before you subscribe", text: "When paid plans become available, this page should show the exact price and currency, billing interval, included usage, applicable taxes, renewal and cancellation terms, and refund policy before checkout." }
        ]
    },
    rules: {
        title: "Community Rules",
        lead: "Use Alien.ai responsibly and respect the people whose work or likeness appears in your content.",
        sections: [
            { title: "Respect rights and consent", list: ["Only upload material you own or are allowed to use.", "Get permission before using another person's name, image, voice, or likeness.", "Do not use the service to impersonate someone or mislead viewers about a real person's actions or endorsement."] },
            { title: "Keep content safe and lawful", list: ["Do not create threats, targeted harassment, or content intended to facilitate violence or abuse.", "Do not create sexual content involving minors or non-consensual intimate imagery.", "Do not use the service for fraud, scams, unlawful discrimination, or other illegal activity."] },
            { title: "Protect private information", text: "Do not upload passwords, financial account credentials, private records, or another person's sensitive information unless you have a clear lawful basis and permission." },
            { title: "Report problems", text: "A reporting or moderation process has not been set up for this preview. The site owner should provide a monitored contact and a response process before opening the service to the public." }
        ]
    },
    terms: {
        title: "Terms of Service",
        lead: "A plain-language draft describing the current Alien.ai preview.",
        notice: "DRAFT — This is general product information, not legal advice or a reviewed legal agreement. Have qualified counsel adapt it to the operator, launch region, and actual product before publication.",
        sections: [
            { title: "The preview service", text: "Alien.ai currently provides a product website and a dashboard interface for demonstration. AI video generation, paid plans, checkout, and mobile applications are not connected. Features may change while the product is being developed." },
            { title: "Demo login", text: "The current login accepts any non-empty username and password. It stores the username in this browser only and does not verify an identity, authenticate with Google, or protect data on a server. Do not enter a real or reused password." },
            { title: "Your content and permissions", text: "You remain responsible for content you submit. You must have the rights, permissions, and legal basis needed to upload or use it. The site should not be used to violate another person's rights or applicable law." },
            { title: "Availability and liability", text: "The preview is provided without a promise that generation, storage, or other unfinished features will be available. Liability limits, warranties, governing law, dispute handling, and consumer rights require review under the applicable law before this draft can become binding terms." },
            { title: "Operator and contact", text: "The legal name, business address, governing jurisdiction, and verified support contact for the service operator have not been provided. Add these details and an effective date before publishing final terms." }
        ]
    },
    privacy: {
        title: "Privacy Policy",
        lead: "A draft overview of data handling for the current website preview.",
        notice: "DRAFT — Confirm these practices against your deployed setup and applicable privacy law. This page is not legal advice or a substitute for a reviewed privacy notice.",
        sections: [
            { title: "Information the preview may process", text: "When you use demo login, the username you enter is stored in this browser's local storage to keep the demo session active. The password is not stored or verified. This is not a real account or identity verification system." },
            { title: "Prompts, uploads, and generated media", text: "In the current local dashboard preview, prompts, selected files, and sample project items are held in page memory. A generation or media-storage backend is not connected, so this preview does not submit those items to an Alien.ai generation API. Review this statement if a backend, analytics, or other services are added." },
            { title: "Cookies and local storage", text: "The demo login stores its username in browser local storage until you log out or clear site data. The site owner should document any analytics, cookies, or additional storage enabled in the production deployment." },
            { title: "Retention, requests, and contact", text: "Retention periods, data-access or deletion request procedures, the service operator's identity, and a privacy contact have not been supplied. Set these policies and provide a monitored contact before collecting real customer data." },
            { title: "Third-party services", text: "The demo login does not connect to Google or another identity provider. Update this notice if third-party authentication, analytics, or other services are added." }
        ]
    },
    cookies: {
        title: "Cookie Policy",
        lead: "Information about browser storage used by the current Alien.ai preview.",
        notice: "DRAFT — Verify your production hosting, analytics, and consent configuration before publishing a final cookie notice.",
        sections: [
            { title: "Demo sign-in storage", text: "The demo login saves the entered username in browser local storage to keep the demo session active. It does not save the password or connect to Google." },
            { title: "Other cookies and analytics", text: "No analytics or advertising integrations are configured in this preview. Hosting providers or future integrations may introduce additional storage; document each one if it is added." },
            { title: "Your choices", text: "You can sign out from the dashboard or clear site data using your browser settings. Clearing authentication storage may sign you out." }
        ]
    },
    refunds: {
        title: "Refund Policy",
        lead: "No paid plans or payment processing are currently available.",
        notice: "There is no Alien.ai checkout or paid subscription in this preview, so no purchases or refunds can currently be processed through this website.",
        sections: [
            { title: "If you believe you were charged", text: "This preview does not accept payments. If an external payment was made in error, contact the payment provider and the merchant shown on your receipt using verified contact details." },
            { title: "Future paid plans", text: "Before payments launch, the service operator must publish eligibility, time limits, cancellation steps, refund method, and any legally required exceptions in this policy and during checkout." },
            { title: "Operator contact", text: "A verified billing contact has not been supplied. Add one before offering paid plans." }
        ]
    },
    faq: {
        title: "Frequently Asked Questions",
        lead: "Quick answers about what works in the current website preview.",
        sections: [
            { title: "Can I generate a finished video now?", text: "Not yet. The generation backend is not connected; the dashboard is a product preview." },
            { title: "How do I sign in?", text: "Enter any non-empty username and password on the demo login page. The username is kept in this browser; the password is not checked or saved. Do not use a real or reused password." },
            { title: "Are paid plans available?", text: "No. Prices, billing, and checkout have not been configured." },
            { title: "Are Android and iOS apps available?", text: "No. The mobile app links currently provide information only; no app has been connected." },
            { title: "Where do I ask for support?", text: "A verified support email or contact form has not been configured. The site owner should publish a monitored support address before launch." }
        ]
    },
    academy: {
        title: "Alien.ai Academy",
        lead: "A starter guide to planning a video concept before generation becomes available.",
        sections: [
            { title: "Start with one clear idea", text: "Write down who the video is for, what happens, and what viewers should remember. A short, specific concept is easier to turn into a sequence of scenes." },
            { title: "Structure the story", list: ["Opening: introduce the setting and main character.", "Middle: give the character a goal and a few meaningful steps.", "Ending: resolve the central idea and choose the final mood."] },
            { title: "Describe visuals consistently", text: "Note the characters, setting, lighting, color palette, camera framing, and aspect ratio. Reuse those details across scenes to help keep a visual direction consistent." },
            { title: "Review before sharing", text: "Check facts, permissions, captions, and music rights. AI-generated features are not connected in the current preview; these notes are planning guidance only." }
        ]
    },
    contact: {
        title: "Contact Alien.ai",
        lead: "Contact details are being prepared for the public launch.",
        notice: "No verified company email address, postal address, or support inbox has been provided. The sample address previously shown on this site was a placeholder and is not presented here as a working contact.",
        sections: [
            { title: "Support", text: "A monitored support channel has not yet been configured. Add the operator's verified business email or contact form before inviting users to rely on support." },
            { title: "Privacy requests", text: "Publish a verified privacy contact and a process for handling data requests before collecting customer information." },
            { title: "Business enquiries", text: "Partnership and press enquiries need a real contact address before this page can accept messages." }
        ]
    },
    partnership: {
        title: "Partnerships",
        lead: "We are preparing information for future creator, product, and business partnerships.",
        sections: [
            { title: "Current availability", text: "No partnership programme, eligibility rules, commercial terms, or application process is configured for this preview." },
            { title: "Before a programme launches", text: "The operator should publish the programme scope, agreement terms, payment details, content rights, disclosure requirements, and a verified business contact." }
        ]
    },
    affiliate: {
        title: "Affiliate Program",
        lead: "There is no active affiliate programme at this time.",
        sections: [
            { title: "Programme status", text: "Commission rates, qualifying purchases, tracking, payout schedule, tax handling, and affiliate terms have not been defined. No referral earnings are promised." },
            { title: "Future updates", text: "If an affiliate programme is introduced, its complete terms and a working application channel will be published here first." }
        ]
    },
    android: {
        title: "Alien.ai for Android",
        lead: "The Android app is not available yet.",
        sections: [
            { title: "Current access", text: "Use the Alien.ai website in a browser. This page does not distribute an Android app or collect app-store credentials." },
            { title: "App availability", text: "There is no verified Google Play listing yet. Only use an official store link if one is published by the service operator." }
        ]
    },
    ios: {
        title: "Alien.ai for iOS",
        lead: "The iOS app is not available yet.",
        sections: [
            { title: "Current access", text: "Use the Alien.ai website in a browser. This page does not distribute an iOS app or collect app-store credentials." },
            { title: "App availability", text: "There is no verified Apple App Store listing yet. Only use an official store link if one is published by the service operator." }
        ]
    },
    tools: {
        title: "AI Video Tools",
        lead: "Explore the creative workflows planned for the Alien.ai workspace.",
        sections: [
            { title: "Planned workflows", list: ["Story and script planning for scene-based videos.", "Text-to-video and image-to-video creation.", "Long-form story, animation, avatar, music, editing, voice, lip-sync, and subtitle workflows."] },
            { title: "Current availability", text: "These pages describe the product direction. AI models and a video-generation provider are not connected in the current dashboard preview." }
        ]
    },
    templates: {
        title: "Video Templates",
        lead: "Plan a video using a clear beginning, middle, and ending.",
        sections: [
            { title: "Story template", list: ["Opening: introduce the character, place, and goal.", "Development: show the challenge and two or three story beats.", "Ending: resolve the challenge and close with one memorable image."] },
            { title: "Explainer template", list: ["State the question or problem.", "Explain the key idea in a few steps.", "End with a useful summary or next step."] },
            { title: "Availability", text: "Template selection and AI rendering are not connected in the current preview. Use these outlines as planning guides." }
        ]
    },
    "story-to-video": {
        title: "Story to Video",
        lead: "Shape a written story into a sequence of visual scenes.",
        sections: [
            { title: "A useful story brief", list: ["Name the audience and main character.", "Describe the setting, goal, and central challenge.", "Break the plot into scenes with one main action each.", "Choose a visual style and ending mood."] },
            { title: "Product status", text: "The story-to-video workflow is a product concept. Automated story conversion and rendering are not connected yet." }
        ]
    },
    "text-to-video": {
        title: "Text to Video",
        lead: "A good video prompt describes what viewers should see, not just the topic.",
        sections: [
            { title: "Prompt structure", text: "Try: subject + action + setting + visual style + camera or lighting + aspect ratio. For example, describe a paper boat drifting down a moonlit stream, with a gentle overhead camera and a calm picture-book style." },
            { title: "Product status", text: "Text-to-video generation is not connected in the current preview. No AI video is produced by submitting a prompt yet." }
        ]
    },
    "image-to-video": {
        title: "Image to Video",
        lead: "Plan how a still image could move while keeping its subject and style recognizable.",
        sections: [
            { title: "Plan the motion", list: ["Choose an image you have permission to use.", "Describe the subject's movement and any camera motion.", "Keep the scene, lighting, and style consistent.", "Avoid asking for conflicting actions in a short clip."] },
            { title: "Product status", text: "Image upload and video generation are not connected to a production AI provider in this preview." }
        ]
    }
};

const page = pages[new URLSearchParams(window.location.search).get("page")] || pages.about;
document.title = `${page.title} | Alien.ai`;
const main = document.getElementById("content");
const eyebrow = document.createElement("p");
eyebrow.className = "eyebrow";
eyebrow.textContent = "Alien.ai · Information";
const heading = document.createElement("h1");
heading.textContent = page.title;
const lead = document.createElement("p");
lead.className = "lead";
lead.textContent = page.lead;
main.append(eyebrow, heading, lead);

if (page.notice) {
    const notice = document.createElement("aside");
    notice.className = "notice";
    notice.textContent = page.notice;
    main.append(notice);
}

if (page.plans) {
    const plans = document.createElement("div");
    plans.className = "plans";
    for (const plan of page.plans) {
        const card = document.createElement("article");
        card.className = "plan";
        const title = document.createElement("h2");
        title.textContent = plan.title;
        const text = document.createElement("p");
        text.textContent = plan.text;
        card.append(title, text);
        plans.append(card);
    }
    main.append(plans);
}

const sections = document.createElement("div");
sections.className = "sections";
for (const item of page.sections || []) {
    const section = document.createElement("section");
    section.className = "section";
    const title = document.createElement("h2");
    title.textContent = item.title;
    section.append(title);
    if (item.text) {
        const text = document.createElement("p");
        text.textContent = item.text;
        section.append(text);
    }
    if (item.list) {
        const list = document.createElement("ul");
        for (const detail of item.list) {
            const entry = document.createElement("li");
            entry.textContent = detail;
            list.append(entry);
        }
        section.append(list);
    }
    sections.append(section);
}
main.append(sections);

const actions = document.createElement("div");
actions.className = "actions";
for (const [label, href, primary] of [
    ["Explore Alien.ai", "index.html", false],
    ["Create an account", "login.html", true]
]) {
    const link = document.createElement("a");
    link.className = `action${primary ? " primary" : ""}`;
    link.href = href;
    link.textContent = label;
    actions.append(link);
}
main.append(actions);
