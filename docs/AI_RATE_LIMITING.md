# AI rate limiting

Ajde gives each signed-in user one private allowance for deliberate AI actions. It starts at **16 points** and refills continuously at **one point every two hours** (12 per day). Idle time can fill the bucket up to 16. There is no weekly reset. A user starting full can consume at most **100 points in any seven days**: 16 available immediately plus 84 earned during the week.

| User action | Points | Maximum provider calls | Input allowance across calls | Maximum output tokens |
| --- | ---: | ---: | --- | --- |
| Natural-language search | 1 | 3 | 46,000 bytes | 1,800 plus two location fallbacks of 1,500 each |
| Translate ride notes | 1 | 1 | 32,000 bytes | 2,000 |
| Read a screenshot and import one selected post | 8 upfront | 1 image call plus the text import below | One image up to 4 MiB, serialized request up to 6 MiB, plus the text import limits below | 6,000 plus the text import outputs |
| Interpret an offer | 2 | 1 | 80,000 bytes | 8,000 |
| Chat assistance | 3 | 1 | 180,000 bytes | 3,000 |
| Import a text post | 6 | 8 | 262,144 bytes | 4,000 plus two fallbacks of 1,500 and five checker rounds of 3,000 |
| Automatic ride-card explanations | 0 | 0 | Localized templates use authorized ride facts | 0 |

Reading a screenshot, importing the resulting text and refining a search four times costs 12 points. A successful read returns a per-user request ID. Selecting one post and creating its draft redeems that ID once, even if the allowance is empty. Additional drafts use the standalone text import rate. A full bucket covers this session with four points left. Someone with two points can search twice immediately. A six-point import becomes eligible in eight hours if they spend no more points. When the balance after a debit would cover fewer than two more actions of the same weight, or falls below one quarter of capacity, the active form warns and shows when the allowance would be full if usage stops. When a successful action leaves too few points to repeat it, its result stays available and the form immediately disables that action until its next eligible time. Displayed estimates add 30 seconds before formatting to the minute in Skopje time, with a tomorrow label when needed. Controls unlock at the actual eligibility time. A denial retains the input and shows when this action can be tried again. At that time the button re-enables and the form announces that a retry is available. The user decides whether to retry. Users can continue using manual features.

## How enforcement works

After authentication, authorization and validation, each paid entry point calls `runAiOperation()` with a server-selected feature. It makes one authenticated `admit_ai_operation` RPC before starting provider work. Authentication, feature data queries and telemetry are separate from that one admission round trip.

Postgres derives the identity from the session and locks admissions for that user in one transaction. It checks the optional request UUID, computes the available points using database time, and either debits the action weight and records the operation or returns its retry time. A repeated admitted UUID returns HTTP 409 during operation retention, including while the original is running. A denial consumes no points and returns HTTP 429 with the rounded-up wait for that feature. A store error prevents paid work. No refill job, lease release or completion write is required for enforcement.

One debit covers all nested model rounds, including fallbacks. An admitted provider failure still consumes the action's points. Each operation has a 120-second deadline. SDK retries are disabled. The shared transport enforces the round count and counts serialized UTF-8 request bytes across all text calls, including prompts, schemas, catalogs and tool history. Screenshots use their own image upload and payload limits. `AI_KILL_SWITCH=true` disables paid calls.

## Weekly cost calibration

The starting weights target roughly **$5 of heavy use over seven days** at the repository's default standard model rates. Dollars are used to tune the weights offline. Admission reads no prices or accumulated spend. Points are units of action allowance, distinct from model tokens.

The planning estimate uses $0.75 per million uncached text input tokens and $4.50 per million output tokens for GPT-5.4 mini. Location fallbacks use GPT-5 mini at $0.25 and $2.00 respectively. For a conservative text estimate, allow one input token per serialized UTF-8 byte and assume each allowed round uses its full output cap. For example, a search uses at most 46,000 serialized bytes across its rounds. Pricing all that input at the more expensive rate gives $0.0345, plus $0.0081 for the main output and $0.006 for the fallbacks: about $0.049 per point. An import similarly models about $0.288 for six points. Screenshot billing depends on image tokenization, dimensions and model, rather than the base64 byte count.

These are launch estimates. Actual invoices depend on tokenization, model, tier, caching and prices. A model override or new paid feature warrants recalibration. Use recorded per-action costs, including all nested rounds, to check the mix of real traffic before tuning weights. See the [versioned pricing table](../ride-share-app/lib/ai/pricing.ts).

## Local UI testing

For a quick test, set the explicit policy on the loopback database to a capacity of 8 and a refill interval of 30 seconds per point. One screenshot import uses all 8 points. Another upload takes four minutes to become available. The selected post can become a review draft immediately. The normal defaults are 16 and 7,200. Use the normal policy for the database smoke and concurrency suites.

## Maintenance

Change policy values and weights through reviewed Supabase migrations. The active values live in `ai_admission_policies` and `ai_admission_features`. Keep the application input, output and round limits consistent with the weights. Existing users receive a full bucket when the weighted policy is first applied.

Provider usage and request outcomes are content-free telemetry. Unknown costs stay unknown. From `ride-share-app/`, run `npm run report:ai -- --days 7` to generate the local aggregate report. Inspect denials, measured costs and missing usage when tuning. Daily cleanup uses the server-only `CRON_SECRET` and retains 35 days of operation history.

Use a migrated local Supabase project and matching local credentials for development. Run `npm run test:db`, `npm run test:db:ai-concurrency` and the mocked application suite. Apply production migrations after merge, coordinate the application deployment with the admission RPC change, and enable the kill switch during the transition.
