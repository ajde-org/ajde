# AJDE-29 translation review

All wording below is draft. No human approval has been recorded. This register covers the currently implemented catalogs, not the entire application. Add rows when migrating the remaining flows.

## Reviewer instructions

- Review every message in context, including labels, full sentences, accessibility text, placeholders and plural variants. Placeholder names in braces must remain unchanged.
- Set Status to Approved only after a human reviews that exact EN/MK pair; fill Reviewer and Date. Revision is the first 12 hex characters of SHA-256(English + newline + Macedonian).
- Changing either message reopens the row as Pending and requires an updated revision. Do not overwrite this file with generated output after human review starts.
- Check natural Macedonian wording and consistent tone. Existing English student-only wording is preserved; changing the audience is outside this ticket.
- Before any PR, every fixed sentence must be human-reviewed. Generated AI prose and external email templates need separate scope decisions recorded in the implementation plan.

## Glossary to confirm

| English | Draft Macedonian | Notes |
| --- | --- | --- |
| Posts | Објави | Explicit ticket requirement; avoid Постови. |
| Find a ride | Најди превоз | Navigation uses informal singular; confirm tone across forms. |
| Offer a ride | Понуди превоз | Distinguish offering transport from taking a trip. |
| Trip | Патување | An actual journey. |
| Seat | Седиште / место | Review context and consistency. |
| Email | Е-пошта | Preserve literal addresses. |

## AI prompt and generated-output review (Pending)

Human review must cover the selected-language instructions and representative outputs below. Passing automated checks does not approve wording or arbitrary future generated sentences. Source excerpts remain authored content.

| Surface | Exact source revision (SHA-256) | Review |
| --- | --- | --- |
| `ride-share-app/lib/ai/explain-match.ts` selected-language prompt | `1c7aff2c10009e70a6070b0c65315c8ce969ec921fd1e6a56dcc80d4e9e099e9` | Pending — reviewer/date not recorded |
| `ride-share-app/lib/ai/chat-assistant.ts` selected-language prompt | `9122813da260bbdef93bbf0b0e47b5696ab37813f88a1f4dffc0d43dfea518c5` | Pending — reviewer/date not recorded |

Live synthetic-data samples from the locale evaluation:

- EN explanation: “Skopje to Bitola, departing Fri 25 Sept at 18:00, with 2 seats for 250 MKD each.”
- MK explanation: “Скопје → Битола, петок 25 септ. во 18:00, со 2 слободни места за 250 MKD по седиште.”
- EN chat answer: “The meeting is agreed for the main station at 18:00.”
- MK chat answer: “Средбата е договорена кај главната станица во 18:00.”

All four samples remain Pending human review. Review natural terminology (including место/седиште and denar notation) and the prompt guidance before approving generated-output coverage.

## Message register (907 messages)

| Key / context | English | Macedonian | Revision | Status | Reviewer | Date |
| --- | --- | --- | --- | --- | --- | --- |
| about.bitolaAlt | Post: free seats, Tuesday 22.09, Skopje to Bitola, leaving at 14:00, message me. | Објава: слободни седишта, вторник 22.09, Скопје до Битола, поаѓање во 14:00, пишете ми. | 72942433222d | Pending | — | — |
| about.calculation | How we calculate savings | Како ги пресметуваме заштедите | d67d4c350a5f | Pending | — | — |
| about.calculationBody | Every accepted passenger seat counts as one car trip that did not happen. We estimate what that trip would have burned using the shared car's real consumption. | Секое прифатено патничко седиште го сметаме за едно избегнато патување со автомобил. Заштеденото гориво го проценуваме според реалната потрошувачка на автомобилот со кој се патува. | 00f54bb63e9f | Pending | — | — |
| about.calculationHeading | Simple math, shown openly. | Едноставна и јасна пресметка. | 9734244358fa | Pending | — | — |
| about.co2Formula | fuel × 2.31 kg per litre of petrol, or 2.68 kg for diesel | гориво × 2,31 kg за литар бензин или 2,68 kg за дизел | 7bf4cb075275 | Pending | — | — |
| about.completedOnly | Only completed rides with petrol or diesel cars and a valid distance count. Demo rides are excluded. | Се бројат само завршени патувања со бензински или дизел автомобили и познато растојание. Пример-патувањата се исклучени. | 9fed21f62683 | Pending | — | — |
| about.costBody | The fuel cost is split the same way, so every seat pays a fair share. | Трошокот за гориво се дели на ист начин, па секој плаќа правичен дел. | 24adfb6839a8 | Pending | — | — |
| about.cta | Your next trip home has room for more. | На следното патување до дома има место за уште некого. | cd7cda85b858 | Pending | — | — |
| about.data | data behind every number | податоци зад секоја бројка | ab067afff560 | Pending | — | — |
| about.dataBody | We count only completed rides with real distance and car data. | Броиме само завршени патувања со вистински податоци за растојанието и автомобилот. | 9e3ca16e64e7 | Pending | — | — |
| about.emissions | the emissions per person | од емисиите по лице | a0fc6bd87dea | Pending | — | — |
| about.emissionsBody | A full car spreads one trip's CO₂ across everyone on board. | Кога автомобилот е полн, CO₂ од патувањето се распределува на сите што патуваат. | a0b5aec55f04 | Pending | — | — |
| about.empty | Empty seats, busy roads | Празни седишта, полни патишта | 1aa99bddde81 | Pending | — | — |
| about.emptyBody | Cars leave with free seats while other students drive the same route alone. | Автомобилите тргнуваат со празни седишта, додека други студенти патуваат сами по истата рута. | 62eeac9461fe | Pending | — | — |
| about.example | Example trip | Пример за патување | ea131777624f | Pending | — | — |
| about.exampleDetails | {distance} km · petrol car using {consumption} L/100 km · {passengers} passengers | {distance} km · бензински автомобил со потрошувачка {consumption} L/100 km · {passengers} патници | 7e4f82bb1472 | Pending | — | — |
| about.familiar | Sound familiar? | Ти звучи познато? | 902d4253800d | Pending | — | — |
| about.familiarBody | One Facebook search turns up group after group, each covering a single route. Dates, times and free seats hide in free text, written differently every time. | Едно пребарување на Facebook открива многу групи, секоја за посебна рута. Датумите, времињата и слободните седишта се скриени во текст, напишан различно во секоја објава. | e6a6c941c4dd | Pending | — | — |
| about.familiarHeading | A group for every route. A format for every post. | За секоја рута — посебна група. Секоја објава — различна. | 0165087af6c9 | Pending | — | — |
| about.find | Find a seat that fits | Најди превоз што ти одговара | ac358441dabe | Pending | — | — |
| about.findBody | Search by city, date and seats. Only students with a verified university email can join. | Пребарувај по град, датум и број на седишта. Можат да се приклучат само студенти со потврдена универзитетска е-пошта. | e391465b44cf | Pending | — | — |
| about.fuel | Fuel | Гориво | bd32f6cf259d | Pending | — | — |
| about.fuelFormula | distance × consumption ÷ 100 | растојание × потрошувачка ÷ 100 | 472dfc4722a4 | Pending | — | — |
| about.greenHeading | The cleanest car trip is the one nobody needs to drive. | Најчистото патување со автомобил е она што не мора да се направи. | 9fb21fa750e2 | Pending | — | — |
| about.groups | groups, one search | групи со едно пребарување | e704de8cc9ae | Pending | — | — |
| about.groupsAlt | Facebook search results showing six ride-sharing groups between Macedonian cities, each with thousands of members and 10 to 20 posts a day. | Резултати од пребарување на Facebook со шест групи за превоз меѓу македонски градови, секоја со илјадници членови и 10 до 20 објави дневно. | 0cc9579a1479 | Pending | — | — |
| about.how | How it works | Како функционира | 35c059ed1345 | Pending | — | — |
| about.howHeading | One place for every ride between cities. | Единствена платформа за секое меѓуградско патување. | 911f4628066c | Pending | — | — |
| about.insteadFour | instead of four | наместо четири | 4b8bd198e634 | Pending | — | — |
| about.kavadarciAlt | Post: looking for one seat tomorrow between 7 and 8 from the DENI terminal to Kavadarci. | Објава: се бара едно место утре меѓу 7 и 8 од терминалот ДЕНИ до Кавадарци. | dc754bf25625 | Pending | — | — |
| about.kocaniAlt | Post in Cyrillic shorthand: Tuesday 22.09, Kočani to Skopje 17:00 to 17:15, Skopje to Kočani 19:30 to 20:00. | Скратена објава на кирилица: вторник 22.09, Кочани до Скопје 17:00 до 17:15, Скопје до Кочани 19:30 до 20:00. | e38c40b2b425 | Pending | — | — |
| about.members | members | членови | a331484594ba | Pending | — | — |
| about.methodology | Completed trips with accepted passengers; demo rides excluded. Participants count each driver or passenger once. Savings assume each passenger seat replaces a separate car; petrol and diesel trips with valid distance and consumption only. | Се бројат завршени патувања со прифатени патници, без пример-патувањата. Секој возач или патник се брои еднаш. Заштедите се пресметуваат под претпоставка дека секој патник заменува посебен автомобил, само за бензински и дизел возила со познато растојание и потрошувачка. | 83d62abc7364 | Pending | — | — |
| about.ohridAlt | Post: ride Ohrid to Skopje on 22.09, 3 seats, leaving at 7:30, with a phone number. | Објава: превоз Охрид до Скопје на 22.09, 3 седишта, поаѓање во 7:30, со телефонски број. | 42203c2c2b89 | Pending | — | — |
| about.oneCar | 1 car | 1 автомобил | 25cfff94c8b1 | Pending | — | — |
| about.oneCarBody | Three passengers in one car keeps three other cars off the road. | Тројца патници во еден автомобил значат три автомобили помалку на патот. | d029c2330c2b | Pending | — | — |
| about.post | Post in your own words | Опиши го патувањето со свои зборови | 6fc7ff35c5b5 | Pending | — | — |
| about.postBody | Describe the trip like you would in a group chat. We turn it into a ride you review before publishing. | Опиши го патувањето како во групна порака. Ние го претвораме во понуда за превоз што ја проверуваш пред да ја објавиш. | 95e4b714a185 | Pending | — | — |
| about.posts | Example ride posts | Примери за објави за превоз | 8be436facbe0 | Pending | — | — |
| about.postsDaily | posts a day | објави дневно | daf2c13d9e60 | Pending | — | — |
| about.price | Guesswork on price | Недифинирани цени | 73a4de4954e6 | Pending | — | — |
| about.priceBody | Drivers guess what to charge. Passengers cannot tell if the price is fair. | Возачите ја одредуваат цената од око. Патниците не знаат дали е правична. | c7557f3d4591 | Pending | — | — |
| about.problem | The problem | Проблемот | 613e5a8de6dd | Pending | — | — |
| about.problemHeading | Getting home should not take six group chats. | За да стигнеш дома, не треба да пребаруваш низ шест групи. | bf4e38d25f1d | Pending | — | — |
| about.real | Real | Реални | eee7c79d968d | Pending | — | — |
| about.realPosts | Real posts from this week. | Вистински објави од оваа недела. | 5f9eef172170 | Pending | — | — |
| about.ride | Ride and split the fuel | Патувајте заедно и поделете го горивото | f40a917b9d15 | Pending | — | — |
| about.rideBody | Chat in a private ride room, share the real fuel cost, and rate each other afterwards. | Договорете се во приватниот разговор за патувањето, поделете го реалниот трошок за гориво и оставете рецензии по патувањето. | 4523f30db632 | Pending | — | — |
| about.route | Skopje to Bitola | Скопје до Битола | 79507291c345 | Pending | — | — |
| about.saved | Saved | Заштедено | fa3bf78dcbb8 | Pending | — | — |
| about.savedCo2 | CO₂ saved | Заштеден CO₂ | 7ebaf355bc02 | Pending | — | — |
| about.savedFormula | trip CO₂ × passenger seats filled | CO₂ од патувањето × пополнети патнички седишта | 02ddc1923ef1 | Pending | — | — |
| about.savedFuel | Fuel saved | Заштедено гориво | 699f9951d5cf | Pending | — | — |
| about.scattered | Scattered across group chats | Расфрлани објави низ групите | f78da32a1891 | Pending | — | — |
| about.scatteredBody | Rides get posted in dozens of Viber and Facebook groups and are buried within minutes. | Превозот се објавува во десетици групи на Viber и Facebook, а објавите се губат меѓу новите пораки за неколку минути. | 63f81ee6c346 | Pending | — | — |
| about.scheduleAlt | Post in Cyrillic: Tuesday to Friday, Bitola to Skopje around 05:30 and 13:00 to 14:00, Skopje to Bitola 11:00 to 14:00 or around 18:00. | Објава на кирилица: вторник до петок, Битола до Скопје околу 05:30 и 13:00 до 14:00, Скопје до Битола 11:00 до 14:00 или околу 18:00. | f25e908cc939 | Pending | — | — |
| about.scroll | Scroll to learn more | Продолжи надолу за повеќе | e778ebc4052c | Pending | — | — |
| about.step | Step {count} | Чекор {count} | 05755b2029f1 | Pending | — | — |
| about.strugaAlt | Post in Cyrillic: hello, I need a ride tomorrow (22.09) from Struga to Prilep after 16h. | Објава на кирилица: здраво, ми треба превоз утре (22.09) од Струга до Прилеп по 16 часот. | 28cab7e987b7 | Pending | — | — |
| about.tripCo2 | CO₂ for the trip | CO₂ од патувањето | 006755dc19f0 | Pending | — | — |
| about.tripFuel | Fuel for the trip | Гориво за патувањето | 5d5400e2c2b3 | Pending | — | — |
| about.vision | Our vision | Нашата визија | 63eed8e0a470 | Pending | — | — |
| about.visionBody | Every weekend, students leave Skopje for their hometowns, mostly in cars with empty seats. We want each of those seats to carry someone. | Секој викенд студентите се враќаат од Скопје во своите градови, најчесто со празни седишта во автомобилите. Сакаме секое седиште да биде пополнето. | df455d841380 | Pending | — | — |
| about.visionHeading | Every trip home, with every seat filled. | Секое патување до дома — сите седишта пополнети. | ec361de3b1e4 | Pending | — | — |
| about.whyGreen | Why it is greener | Зошто е подобро за природата | 66320895150e | Pending | — | — |
| app.description | Share rides and real travel costs with students across North Macedonia. | Патувајте заедно и поделете ги реалните патни трошоци со студенти низ Северна Македонија. | 240423357072 | Pending | — | — |
| app.title | Student Ride Share | Студентски заеднички превоз | 7117f167853e | Pending | — | — |
| auth.access | Account access | Пристап до сметката | 613087b70ce4 | Pending | — | — |
| auth.accountHint | One email, one account. Your first sign-in creates your account automatically. | Една е-пошта, една сметка. При првата најава сметката се создава автоматски. | d90ea571c98c | Pending | — | — |
| auth.approvedEmail | Use an approved student email address to continue. | За да продолжите, внесете е-пошта од одобрен студентски домен. | 8fab22e61db4 | Pending | — | — |
| auth.company | The journey is better with good company. | Патувањето е поубаво со добро друштво. | 9f064b2bfdf8 | Pending | — | — |
| auth.continuing | Continuing… | Се обработува… | 3e35a9d2f812 | Pending | — | — |
| auth.cost | Split the real cost | Поделете го трошокот | d13b48600a69 | Pending | — | — |
| auth.costBody | Share fuel fairly instead of paying for empty seats. | Поделете го трошокот за гориво правично, наместо да плаќате за празни седишта. | 28a08cb246cf | Pending | — | — |
| auth.email | Student email | Студентска е-пошта | 8ed12f78bfc0 | Pending | — | — |
| auth.emailHint | Use your university-issued student email address. | Користете ја студентската е-пошта доделена од вашиот универзитет. | 4d43bed70486 | Pending | — | — |
| auth.failed | Sign-in failed. Please try again. | Најавата не успеа. Обидете се повторно. | a956949e6868 | Pending | — | — |
| auth.invalidDomain | That account is not from an approved student domain. | Сметката не е од одобрен студентски домен. | 135aa7cbf1d9 | Pending | — | — |
| auth.invalidLink | That sign-in link is invalid or has expired. Request a new one below. | Врската за најава не е важечка или е истечена. Побарајте нова подолу. | 591d583a1889 | Pending | — | — |
| auth.nextRide | Your next ride starts here | Твоето следно патување почнува тука | 0e58e4066910 | Pending | — | — |
| auth.originError | Could not determine the application URL. | Адресата на апликацијата не може да се утврди. | c20dabc2b8c7 | Pending | — | — |
| auth.planet | Lighter on the planet | Помал товар за природата | 8cc1c9371221 | Pending | — | — |
| auth.planetBody | One shared car keeps up to three others off the road. | Еден заеднички автомобил значи до три автомобили помалку на патот. | e1803c551db6 | Pending | — | — |
| auth.rateLimited | Email sending is temporarily rate-limited. Wait before requesting another link, or use Sign in instead. | Испраќањето е-пошта е привремено ограничено. Почекајте пред да побарате нова врска или изберете „Најави се“. | 66630178701b | Pending | — | — |
| auth.resend | Send another link | Испрати нова врска | 790df20c270a | Pending | — | — |
| auth.send | Email me a sign-up link | Испрати ми врска за регистрација | 0fe2f611828b | Pending | — | — |
| auth.sendFailed | We could not send the sign-in link. Please try again. | Врската за најава не е испратена. Обидете се повторно. | 362f56161293 | Pending | — | — |
| auth.sent | A secure sign-in link was sent to {email}. | Линк за регистрација е испратен на: {email}. | d7cce83e57ef | Pending | — | — |
| auth.signedOut | You have been signed out safely. | Успешно се одјавивте. | 57f7096e5170 | Pending | — | — |
| auth.signinIntro | Enter your student email to sign in. No password needed. | Внеси ја студентската е-пошта за да се најавиш. Не е потребна лозинка. | 837ed2407959 | Pending | — | — |
| auth.signupIntro | Start with your student email. We’ll help you set up the rest. | Почни со студентската е-пошта. Ќе ти помогнеме со останатото. | 75e26ac0be87 | Pending | — | — |
| auth.students | Students only | Само за студенти | 0e89506fc3ed | Pending | — | — |
| auth.studentsBody | Every account is verified with a university email. | Секоја сметка се потврдува со универзитетска е-пошта. | 15a6e7bca1e9 | Pending | — | — |
| auth.title | Sign in or sign up | Најава или регистрација | 4d7f6a001660 | Pending | — | — |
| auth.welcome | Welcome back | Добредојде назад | ddfb9226f71b | Pending | — | — |
| booking.closed | This ride is not accepting seat requests. | За ова патување не се прифаќаат барања за место. | e235000302cb | Pending | — | — |
| booking.departed | This ride has already departed. | Ова патување веќе започнало. | b4291a920c62 | Pending | — | — |
| booking.duplicate | You already have an active request for this ride. | Веќе имаш активно барање за ова патување. | 7ad37576f890 | Pending | — | — |
| booking.failed | Your request could not be sent. Please try again. | Барањето не може да се испрати. Обиди се повторно. | 0a6885fb744d | Pending | — | — |
| booking.invalid | Check your message and try again. | Провери ја пораката и обиди се повторно. | fab0d576f067 | Pending | — | — |
| booking.noDriver | This imported ride needs a driver before it can accept bookings. | За ова увезено патување е потребен возач пред да се прифаќаат барања. | 191ede53bce5 | Pending | — | — |
| booking.noSeats | There are not enough seats available. | Нема доволно слободни места. | 42f5e20c7235 | Pending | — | — |
| booking.ownRide | You cannot request a seat on your own ride. | Не можеш да побараш место во сопственото патување. | 913d1d9f4e27 | Pending | — | — |
| booking.sameGender | This driver accepts requests only from students of the same gender. | Овој возач прифаќа барања само од студенти од ист пол. | 09447e08f95e | Pending | — | — |
| booking.sent | Seat request sent to the driver. | Барањето за место е испратено до возачот. | 620fb78cb7a7 | Pending | — | — |
| booking.unavailable | This ride is no longer available. | Ова патување веќе не е достапно. | e62a4c3adca1 | Pending | — | — |
| cancel.ack | I understand that confirmed passengers will need other plans. | Разбирам дека потврдените патници ќе треба да организираат друго патување. | bdad03f13c47 | Pending | — | — |
| cancel.change | Change of plans? | Промена на плановите? | c19a476eab19 | Pending | — | — |
| cancel.changed | The ride changed and could not be cancelled. Refresh and try again. | Превозот е променет и не можеше да се откаже. Освежи ја страницата и обиди се повторно. | 94f59959f36e | Pending | — | — |
| cancel.confirm | Confirm cancellation | Потврди откажување | 63529ed5e507 | Pending | — | — |
| cancel.done | Ride cancelled. Confirmed passengers will see the cancellation in My trips. | Превозот е откажан. Потврдените патници ќе го видат откажувањето во Мои патувања. | 15f949dd813e | Pending | — | — |
| cancel.failed | Could not cancel the ride. Please try again. | Превозот не можеше да се откаже. Обиди се повторно. | 654df9dbb488 | Pending | — | — |
| cancel.full.one | This ride is full with {count} confirmed seat. Cancelling affects every confirmed passenger. | Превозот е пополнет со {count} потврдено место. Откажувањето ги засега сите потврдени патници. | 1c11a4beb097 | Pending | — | — |
| cancel.full.other | This ride is full with {count} confirmed seats. Cancelling affects every confirmed passenger. | Превозот е пополнет со {count} потврдени места. Откажувањето ги засега сите потврдени патници. | b6d68d6fc1f9 | Pending | — | — |
| cancel.futureOnly | Only future published or full rides can be cancelled. | Може да се откаже само објавен или пополнет превоз со идно поаѓање. | 2ecee035ad30 | Pending | — | — |
| cancel.keep | Keep ride | Задржи го превозот | 2a34314905f1 | Pending | — | — |
| cancel.needsAck | This ride is full. Confirm that you understand passengers will need to make other plans. | Превозот е пополнет. Потврди дека разбираш дека патниците ќе треба да организираат друго патување. | aeaeccc93100 | Pending | — | — |
| cancel.pending | Cancelling… | Се откажува… | f15e8f627739 | Pending | — | — |
| cancel.signIn | Sign in to cancel your ride. | Најави се за да го откажеш превозот. | faafab32c114 | Pending | — | — |
| cancel.title | Cancel ride | Откажи превоз | d59655282a95 | Pending | — | — |
| cancel.warning | Passengers will see that the ride was cancelled and will need to make other plans. | Патниците ќе видат дека превозот е откажан и ќе треба да организираат друго патување. | 6ef16cf30fb2 | Pending | — | — |
| chat.connected | Connected | Поврзано | a9ddc8e55c49 | Pending | — | — |
| chat.connecting | Connecting | Се поврзува | 9ef43f55468b | Pending | — | — |
| chat.count.one | {count} message | {count} порака | 2fca379157de | Pending | — | — |
| chat.count.other | {count} messages | {count} пораки | b497e495b3a2 | Pending | — | — |
| chat.details | Ride details | Детали за превозот | 0e33dd33c1af | Pending | — | — |
| chat.driver |  · Driver |  · Возач | ab11d74f88bf | Pending | — | — |
| chat.empty | No messages yet. Say hello to your ride group. | Сè уште нема пораки. Поздрави ги сопатниците. | 9b0ebf1c6608 | Pending | — | — |
| chat.error.closed | This room is read-only. | Во овој разговор може само да се чита. | 2ba9eff7b02f | Pending | — | — |
| chat.error.database | The chat could not be updated. Please retry. | Разговорот не можеше да се ажурира. Обиди се повторно. | 19472ac55669 | Pending | — | — |
| chat.error.invalid | Check your message and try again. | Провери ја пораката и обиди се повторно. | fab0d576f067 | Pending | — | — |
| chat.error.unavailable | You no longer have access to this room. | Повеќе немаш пристап до овој разговор. | ea152a1a1bdc | Pending | — | — |
| chat.find | Find a ride | Најди превоз | d72d22e24b08 | Pending | — | — |
| chat.former | Former participant | Поранешен учесник | c6d14ac83606 | Pending | — | — |
| chat.history | Message history | Историја на пораки | bc3ce9ee674c | Pending | — | — |
| chat.historyFailed | Older messages could not be loaded. Please retry. | Постарите пораки не можеа да се вчитаат. Обиди се повторно. | b003f5668770 | Pending | — | — |
| chat.keyboard | Enter to send · Shift+Enter for a new line · {count}/2000 | Enter за испраќање · Shift+Enter за нов ред · {count}/2000 | f47e95370760 | Pending | — | — |
| chat.label | Message to the ride group | Порака до сопатниците | 30e8c24ed0a9 | Pending | — | — |
| chat.loadFailed | Could not load the ride room | Собата за разговор не може да се вчита | acb0195d2dd0 | Pending | — | — |
| chat.loadOlder | Load older messages | Вчитај постари пораки | 526c5a23ba1b | Pending | — | — |
| chat.loadingOlder | Loading older messages… | Се вчитуваат постарите пораки… | 2239f0dc9448 | Pending | — | — |
| chat.membersOnly | This room is available only to its driver and currently accepted passengers. | Овој разговор е достапен само за возачот и тековно прифатените патници. | 3a17d7f14b82 | Pending | — | — |
| chat.messagesLabel | Room messages | Пораки во разговорот | 4b3f4ef788ed | Pending | — | — |
| chat.new.one | {count} new message in the ride room. | {count} нова порака во разговорот. | 469e14356bc6 | Pending | — | — |
| chat.new.other | {count} new messages in the ride room. | {count} нови пораки во разговорот. | 481879806042 | Pending | — | — |
| chat.noAccess | You no longer have access to this room. | Повеќе немаш пристап до овој разговор. | ea152a1a1bdc | Pending | — | — |
| chat.offline | Offline — retry when connected | Нема интернет — обиди се повторно кога ќе се поврзеш | 1fae00aad3a2 | Pending | — | — |
| chat.participants | Participants · {count} | Учесници · {count} | c66d3a161d6d | Pending | — | — |
| chat.participantsLabel | Room participants | Учесници во разговорот | e8f330ccf4dc | Pending | — | — |
| chat.placeholder | Message the ride group… | Напиши порака до сопатниците… | a8af758d56a8 | Pending | — | — |
| chat.privacy | The driver and all currently accepted passengers can read the entire room history, including messages sent before they joined. Messages are kept as a ride record. | Возачот и сите тековно прифатени патници можат да го прочитаат целиот разговор, вклучувајќи ги и пораките испратени пред да се приклучат. Пораките се чуваат како запис за патувањето. | fd464409e21c | Pending | — | — |
| chat.privateTitle | Private ride room | Приватен разговор за патувањето | beba04419b35 | Pending | — | — |
| chat.readOnly | This room is read-only. Sending closes when the ride is cancelled or 48 hours after departure. | Овој разговор е достапен само за читање. Испраќањето пораки се затвора кога превозот ќе биде откажан или 48 часа по поаѓањето. | 927c945052d3 | Pending | — | — |
| chat.reconnect | Reconnect needed | Потребно е повторно поврзување | 3f6a2db53a6b | Pending | — | — |
| chat.reconnecting | Reconnecting | Повторно се поврзува | 2d902020a065 | Pending | — | — |
| chat.retry | Retry connection | Поврзи се повторно | 3fd7ae2b062b | Pending | — | — |
| chat.room | Ride room | Соба за разговор за патувањето | e2991fed8ef2 | Pending | — | — |
| chat.send | Send message | Испрати порака | 016be034ae86 | Pending | — | — |
| chat.sendFailed | Message was not confirmed. Check the timeline before retrying. | Пораката не е потврдена. Провери го разговорот пред да се обидеш повторно. | 6bab23b91224 | Pending | — | — |
| chat.sending | Sending… | Се испраќа… | 1733d5311be5 | Pending | — | — |
| chat.title | Ride room | Разговор за патувањето | 96edb360b3ee | Pending | — | — |
| chat.unavailableTitle | Ride room unavailable | Разговорот за патувањето не е достапен | 13fe6d66abf9 | Pending | — | — |
| chatAi.answerTitle | AI answer | Одговор од ВИ | 5d4610edf69b | Pending | — | — |
| chatAi.ask | Ask AI | Прашај ВИ | 5de9a4c6b973 | Pending | — | — |
| chatAi.basis.one | Based on {count} message through {date} (Skopje time). Check the source messages before relying on the answer. | Врз основа на {count} порака до {date} (скопско време). Провери ги изворните пораки пред да се потпреш на одговорот. | b0ebf2abcc92 | Pending | — | — |
| chatAi.basis.other | Based on {count} messages through {date} (Skopje time). Check the source messages before relying on the answer. | Врз основа на {count} пораки до {date} (скопско време). Провери ги изворните пораки пред да се потпреш на одговорот. | 24a59dd8a895 | Pending | — | — |
| chatAi.category.decision | Agreed | Договорено | 0f2e9d4f3e0b | Pending | — | — |
| chatAi.category.information | From the chat | Од разговорот | 97a38a5ed2af | Pending | — | — |
| chatAi.category.open_question | Still open | Сè уште отворено | 3ba5ff88c85b | Pending | — | — |
| chatAi.close | Close | Затвори | bc0ff07f6036 | Pending | — | — |
| chatAi.closeLabel | Close AI panel | Затвори го панелот за ВИ | 0c9ff122889e | Pending | — | — |
| chatAi.dialog | Private chat assistant | Приватен помошник за разговорот | 7ed4f9375693 | Pending | — | — |
| chatAi.error.database | Chat history could not be loaded. Please retry. | Разговорот не можеше да се вчита. Обиди се повторно. | d7a41e272a0d | Pending | — | — |
| chatAi.error.disabled | AI chat assistance is disabled. You can still read and send messages. | Помошта со ВИ е исклучена. Сè уште можеш да читаш и испраќаш пораки. | ced4b5302ad4 | Pending | — | — |
| chatAi.error.empty | No messages to summarize or ask about yet. | Сè уште нема пораки за резиме или прашање. | 116a0962715f | Pending | — | — |
| chatAi.error.invalid | Ask a question between 1 and 1,000 characters about this chat. | Постави прашање за овој разговор со должина од 1 до 1.000 знаци. | 2b08d7e1ad5a | Pending | — | — |
| chatAi.error.invalid_output | AI could not provide a verified response. Please try again. | ВИ не можеше да даде проверен одговор. Обиди се повторно. | 8dca4617db12 | Pending | — | — |
| chatAi.error.missing_key | AI chat assistance is not configured. You can still read and send messages. | Помошта со ВИ не е поставена. Сè уште можеш да читаш и испраќаш пораки. | 784b1b10206f | Pending | — | — |
| chatAi.error.provider | AI is temporarily unavailable. Please try again. | ВИ моментално не е достапна. Обиди се повторно. | 1c09938f3ff3 | Pending | — | — |
| chatAi.error.rate_limit | AI request limit reached. Wait a minute before trying again. | Го достигна ограничувањето за барања до ВИ. Почекај една минута пред повторно да се обидеш. | fdbeef654f5a | Pending | — | — |
| chatAi.error.refusal | AI could not answer this request. Try a different question about the chat. | ВИ не можеше да одговори на ова барање. Постави друго прашање за разговорот. | b0e7d68b14a2 | Pending | — | — |
| chatAi.error.timeout | AI took too long to respond. Please try again. | ВИ не одговори навреме. Обиди се повторно. | 363dfef69c24 | Pending | — | — |
| chatAi.error.too_large | Chat is too long for AI assistance. You can still browse its full history. | Разговорот е предолг за помош со ВИ. Сè уште можеш да ја прегледаш целата историја. | a325039e0bd0 | Pending | — | — |
| chatAi.error.unavailable | This ride room is unavailable. | Овој разговор не е достапен. | fa2d3815b601 | Pending | — | — |
| chatAi.hint | Ask a complete question each time · {count}/1000 | Секојпат постави целосно прашање · {count}/1000 | d254f5d01e3e | Pending | — | — |
| chatAi.languageChanged | The language changed. Refresh the AI answer to use the selected language. | Јазикот е променет. Освежи го одговорот од ВИ за да биде на избраниот јазик. | 6171cde0837b | Pending | — | — |
| chatAi.network | AI could not be reached. Your question is still here; please retry. | ВИ не е достапна. Твоето прашање е зачувано; обиди се повторно. | 4db8bc6db82f | Pending | — | — |
| chatAi.noAnswer | The chat does not say. | Во разговорот нема одговор на ова. | bb7d8f7ec3fe | Pending | — | — |
| chatAi.noSummary | There is not enough information in the chat to summarize yet. | Во разговорот сè уште нема доволно информации за резиме. | 795772f4a584 | Pending | — | — |
| chatAi.onlyYou | Only you see these questions and answers. | Само ти ги гледаш овие прашања и одговори. | 3c9ca8556c89 | Pending | — | — |
| chatAi.placeholder | Where did we agree to meet? | Каде се договоривме да се сретнеме? | f52c8378a4d1 | Pending | — | — |
| chatAi.privacy | Using AI sends this room’s messages to OpenAI, including anything members typed into them. | Користењето ВИ ги испраќа пораките од овој разговор до OpenAI, вклучувајќи сè што напишале учесниците. | ecc3f8425d3f | Pending | — | — |
| chatAi.private | Only you see the answer | Само ти го гледаш одговорот | 8ff95fa9fd51 | Pending | — | — |
| chatAi.question | Your question | Твоето прашање | 1388ddd0ce4d | Pending | — | — |
| chatAi.reading | Reading the chat… | Се чита разговорот… | 9c8c37f34ebc | Pending | — | — |
| chatAi.refresh | Refresh AI answer | Освежи го одговорот од ВИ | b8ffec914ad7 | Pending | — | — |
| chatAi.response | AI response | Одговор од ВИ | 654f2648cf33 | Pending | — | — |
| chatAi.retry | Retry AI request | Обиди се повторно со ВИ | 173a68d730f4 | Pending | — | — |
| chatAi.sources | Source messages ({count}) | Изворни пораки ({count}) | a6ccce1d1151 | Pending | — | — |
| chatAi.stale | New messages since this answer. | Има нови пораки по овој одговор. | 4d6541d4d6df | Pending | — | — |
| chatAi.submit | Ask about chat | Прашај за разговорот | d6588bc189f2 | Pending | — | — |
| chatAi.summary | Summarize chat | Сумирај го разговорот | 6ca14f02934f | Pending | — | — |
| chatAi.summaryTitle | Chat summary | Резиме на разговорот | b3bc127e1ac6 | Pending | — | — |
| chatAi.time | {date} · Skopje time | {date} · скопско време | 65ce9bb33bff | Pending | — | — |
| chatAi.title | Ask about this chat | Прашај за овој разговор | c3877254ec6c | Pending | — | — |
| chatAi.youAsked | You asked | Твоето прашање | b55166b658a4 | Pending | — | — |
| check.basis.one | Basis: {distance} km, shared across {seats} available seat, {fuelPrice} MKD/L. | Основа: {distance} km, поделени на {seats} слободно место, {fuelPrice} денари/L. | ce23a27f7b1f | Pending | — | — |
| check.basis.other | Basis: {distance} km, shared across {seats} available seats, {fuelPrice} MKD/L. | Основа: {distance} km, поделени на {seats} слободни места, {fuelPrice} денари/L. | e03b8c66a10f | Pending | — | — |
| check.caveat | Evidence supports this review; it does not guarantee that a ride offer is correct. | Податоците помагаат при проверката, но не гарантираат дека понудата за превоз е точна. | 2aadc73f6ef7 | Pending | — | — |
| check.defaultConsumption | Consumption uses a default estimate. | За потрошувачката е користена стандардна проценка. | ef32f9d08f42 | Pending | — | — |
| check.defaultFuel | The fuel type is a default approximation because the actual type is unknown or unsupported. | Видот на горивото е приближна претпоставка бидејќи вистинскиот вид е непознат или неподдржан. | 6d1b8f0f5cba | Pending | — | — |
| check.destination | Destination city | Град на пристигнување | b31bd311e09e | Pending | — | — |
| check.distance | Road distance {origin} → {destination}: {distance} km (editable city-to-city estimate). | Патно растојание {origin} → {destination}: {distance} km (проценка меѓу градовите што можеш да ја промениш). | e9204a780dfa | Pending | — | — |
| check.empty | No tool evidence was returned. Review every field. | Не се добиени податоци од проверката. Провери го секое поле. | d7101e79cc4b | Pending | — | — |
| check.failed | Automatic plausibility check was unavailable. Review every field. | Автоматската проверка не беше достапна. Провери го секое поле. | 8adcce38d9f6 | Pending | — | — |
| check.fuel | Fuel: {fuel}. Consumption: {consumption} L/100 km. | Гориво: {fuel}. Потрошувачка: {consumption} L/100 km. | 7dbe9160ee26 | Pending | — | — |
| check.label | Check evidence | Податоци од проверката | b580484ef818 | Pending | — | — |
| check.match.one | {departure} (Skopje) · {price} · {seats} available seat | {departure} (Скопје) · {price} · {seats} слободно место | 8466e774d0bc | Pending | — | — |
| check.match.other | {departure} (Skopje) · {price} · {seats} available seats | {departure} (Скопје) · {price} · {seats} слободни места | 2ce82b9ba729 | Pending | — | — |
| check.matchCaveat | Review these matches before deciding whether to publish. Similar route and time do not establish a duplicate. | Провери ги совпаѓањата пред да објавиш. Слична рута и време не значат дека постои дупликат. | e54f4b439d73 | Pending | — | — |
| check.matches | Possible duplicates: {origin} → {destination} (same route, within three hours). | Можни дупликати: {origin} → {destination} (иста рута, во период од три часа). | c31fe44655a3 | Pending | — | — |
| check.noMatches | No published or full ride offers found on {origin} → {destination} within three hours of departure. This limited search does not rule out other duplicates. | Не се пронајдени објавени или пополнети понуди од {origin} → {destination} во три часа околу поаѓањето. Ова ограничено пребарување не исклучува други дупликати. | f544b2a0c8ad | Pending | — | — |
| check.noTolls | Tolls are excluded. Review these assumptions and keep or edit your price. | Патарините не се вклучени. Провери ги претпоставките и задржи ја или промени ја цената. | e9575f5984ca | Pending | — | — |
| check.origin | Origin city | Град на поаѓање | d04387af28d3 | Pending | — | — |
| check.price | Fair share: {seat} per seat; {total} total trip cost. | Разумна цена: {seat} по место; вкупен патен трошок {total}. | 04d7d6880450 | Pending | — | — |
| check.priceUnavailable | Fair-share evidence is unavailable. Review your price manually. | Податоците за разумна цена не се достапни. Провери ја цената рачно. | 8f20563f7f7e | Pending | — | — |
| check.priceUnknown | Price unavailable | Цената не е достапна | 772d4a77adba | Pending | — | — |
| check.roadUnavailable | Road distance is unavailable. Review the route and distance manually. | Растојанието по пат не е достапно. Провери ги рутата и растојанието рачно. | d944e51e17a8 | Pending | — | — |
| check.seatPrice | {price} per seat | {price} по место | d43da58e7a0c | Pending | — | — |
| check.similarUnavailable | Similar-ride search evidence is unavailable. | Податоците за слични патувања не се достапни. | 2405fe4f25c3 | Pending | — | — |
| check.title | How we checked this | Како го проверивме ова | b13f3be74d73 | Pending | — | — |
| check.unavailable | Check evidence unavailable. | Податоците од проверката не се достапни. | fea166fe4e97 | Pending | — | — |
| common.connection | Check your connection and try again. | Проверете ја интернет-врската и обидете се повторно. | 0a639d54174c | Pending | — | — |
| common.error | Something went wrong | Настана грешка | 2513bd2a33cf | Pending | — | — |
| common.home | Back to home | Назад на почетната страница | 167da07a0fa6 | Pending | — | — |
| common.loadFailed | We could not load this page | Страницата не може да се вчита | 760834d1eebf | Pending | — | — |
| common.loading | Loading… | Се вчитува… | 512cab753a79 | Pending | — | — |
| common.notFound | Page not found | Страницата не е пронајдена | 4ea4d85b1c24 | Pending | — | — |
| common.notFoundBody | This page does not exist or is no longer available. | Оваа страница не постои или повеќе не е достапна. | f5bf85a1cb16 | Pending | — | — |
| common.retry | Try again | Обидете се повторно | aa0217c7a691 | Pending | — | — |
| common.saving | Saving… | Се зачувува… | 34d6319db92d | Pending | — | — |
| completion.already | This ride is already completed. | Овој превоз веќе е завршен. | f3ecefd41f69 | Pending | — | — |
| completion.changed | The ride changed. Refresh before trying again. | Превозот е променет. Освежи ја страницата пред повторно да се обидеш. | 6903325ffe1d | Pending | — | — |
| completion.done | Ride marked completed. | Превозот е означен како завршен. | f7432e993b1c | Pending | — | — |
| completion.failed | Could not complete the ride. Please try again. | Превозот не можеше да се означи како завршен. Обиди се повторно. | b09e9223f053 | Pending | — | — |
| completion.invalid | Invalid ride. | Невалиден превоз. | c472ce0b87e1 | Pending | — | — |
| completion.mark | Mark completed | Означи како завршено | ecefd082c759 | Pending | — | — |
| completion.notDeparted | Only departed published or full rides can be completed. | Само објавен или пополнет превоз со поминато време на поаѓање може да се означи како завршен. | be856ed69dc4 | Pending | — | — |
| completion.notFound | Unable to find your ride. | Твојот превоз не е пронајден. | 8c2ad17e4cda | Pending | — | — |
| completion.pending | Marking completed… | Се означува како завршено… | 963b37c78351 | Pending | — | — |
| completion.signIn | Sign in to complete your ride. | Најави се за да го означиш превозот како завршен. | 850c874a904b | Pending | — | — |
| contact.invalidPhone | Enter a valid phone number, including your country code. | Внеси важечки телефонски број со повикувачки број на државата. | 4353aa9ad9a3 | Pending | — | — |
| contact.invalidSocial | Enter a full HTTPS profile link, such as https://instagram.com/yourname. | Внеси целосна HTTPS врска до профил, на пример https://instagram.com/yourname. | 41f4d0f27aa5 | Pending | — | — |
| contact.missing | Contact details not added yet. | Сè уште нема податоци за контакт. | 9031e11d1bb9 | Pending | — | — |
| contact.phoneDigits | Use a phone number with 7–15 digits. | Телефонскиот број треба да има од 7 до 15 цифри. | 3f2f0a5293c8 | Pending | — | — |
| contact.social | Social profile on {host} (opens in a new tab) | Профил на {host} (се отвора во ново јазиче) | 9e0a4665591d | Pending | — | — |
| date.any | Any day | Кој било ден | 44ebb6be2fc6 | Pending | — | — |
| date.chooseATime | Choose a time | Изберете време | 6c9a96e6a0ec | Pending | — | — |
| date.chooseDate | Choose a departure date | Изберете датум на поаѓање | 930375e8b9ee | Pending | — | — |
| date.chooseDateTime | Choose date and time | Изберете датум и време | 96fa2eec5ea4 | Pending | — | — |
| date.chooseTime | Choose time | Изберете време | 36e42b4b6f35 | Pending | — | — |
| date.dayFirst | Pick a day first | Прво изберете ден | f3433f9eca38 | Pending | — | — |
| date.departureDateTime | Choose departure date and time | Изберете датум и време на поаѓање | 80fd678f108e | Pending | — | — |
| date.done | Done | Готово | 3d66d96f01d7 | Pending | — | — |
| date.hour | Hour | Час | fb345cdc8cf9 | Pending | — | — |
| date.limit | Choose a future time within 90 days, in Skopje time. | Изберете време во следните 90 дена, според времето во Скопје. | 7ee6e805cfbf | Pending | — | — |
| date.minute | Minute | Минута | c33813abade4 | Pending | — | — |
| date.nextMonth | Next month | Следен месец | 82217582da1e | Pending | — | — |
| date.previousMonth | Previous month | Претходен месец | bcbbe954335e | Pending | — | — |
| date.summary | {date} · {time} | {date} · {time} | 14357dd81062 | Pending | — | — |
| date.time | Time | Време | ceda7736d5f6 | Pending | — | — |
| date.today | Today | Денес | f7bc9cde01c1 | Pending | — | — |
| date.tomorrow | Tomorrow | Утре | 48b7b994d80f | Pending | — | — |
| date.weekend | Weekend | Викенд | 097f119601d4 | Pending | — | — |
| detail.another | Find another ride | Најди друг превоз | 4e2b70435306 | Pending | — | — |
| detail.awaitingDriver | Imported ride awaiting a driver. | Увезено патување што чека возач. | 5e200d8696d2 | Pending | — | — |
| detail.back | Back to rides | Назад кон превозите | b38f8e7b7dcc | Pending | — | — |
| detail.browse | Browse rides | Прегледај превози | 29b13225f379 | Pending | — | — |
| detail.chat | Ride chat | Разговор за патувањето | 067a6fe0b15a | Pending | — | — |
| detail.closed | This ride is not accepting requests. | За ова патување не се прифаќаат барања. | 974441b1215d | Pending | — | — |
| detail.driver | Your driver | Твојот возач | 0006baa9036a | Pending | — | — |
| detail.manage | Manage my ride | Управувај со патувањето | 662b8a0b5157 | Pending | — | — |
| detail.manageTrips | Manage in My trips | Управувај во Мои патувања | 7cf2e20b6975 | Pending | — | — |
| detail.message | Message (optional) | Порака (незадолжително) | 0ab37e554f05 | Pending | — | — |
| detail.messagePlaceholder | Introduce yourself or mention luggage. | Претстави се или наведи дали носиш багаж. | 13d0032026ae | Pending | — | — |
| detail.notFound | Ride not found | Патувањето не е пронајдено | 222025ae9234 | Pending | — | — |
| detail.notFoundBody | It may have been removed or is no longer public. | Можеби е отстрането или веќе не е јавно достапно. | 335185d14d77 | Pending | — | — |
| detail.notes | Driver notes | Белешки од возачот | 75cb0c095227 | Pending | — | — |
| detail.openChat | Open ride chat | Отвори го разговорот | 325ce3552501 | Pending | — | — |
| detail.openChatLabel | Open ride chat for {route} | Отвори го разговорот за {route} | 88134f998e74 | Pending | — | — |
| detail.ownRide | This is your ride. Manage requests from the driver dashboard. | Ова е твоето патување. Управувај со барањата преку прегледот за возачи. | 5a0cd323129f | Pending | — | — |
| detail.phoneNotice | Your phone number will be shared with the driver when you send this request. | Возачот ќе го види твојот телефонски број кога ќе го испратиш барањето. | 432daca3fc46 | Pending | — | — |
| detail.planDriver | Plan pickup with your passengers. | Договори го поаѓањето со патниците. | a049d9359da4 | Pending | — | — |
| detail.planPassenger | Plan pickup with your driver and passengers. | Договори го поаѓањето со возачот и патниците. | 2c16456dac42 | Pending | — | — |
| detail.request | Request a seat | Побарај место | 83faaab384c5 | Pending | — | — |
| detail.requestHelp | Each request reserves one seat, just for you. It is confirmed when the driver accepts. Track the response in My trips. | Секое барање е за едно место, само за тебе. Местото е потврдено кога возачот ќе го прифати барањето. Одговорот следи го во Мои патувања. | 5f5da0691b03 | Pending | — | — |
| detail.ride | Ride | Патување | 363b20b93315 | Pending | — | — |
| detail.sameGender | This ride accepts same-gender requests only. | За ова патување се прифаќаат само барања од лица од ист пол како возачот. | 57b2816b9049 | Pending | — | — |
| detail.sending | Sending request… | Се испраќа барањето… | 232df4cbf767 | Pending | — | — |
| detail.submit | Request my seat | Испрати барање за место | 39ca33cb2fa9 | Pending | — | — |
| detail.title | Ride details | Детали за патувањето | 6492f54df159 | Pending | — | — |
| detail.withDriver | Your seat request is with the driver. | Барањето за место е испратено до возачот. | 6477143eaba4 | Pending | — | — |
| discovery.afterTime | At or after | Во или по | 03c1dea8166f | Pending | — | — |
| discovery.all | Show all rides | Прикажи ги сите патувања | e21036e778f1 | Pending | — | — |
| discovery.anywhere | Anywhere | Каде било | c3bfc73ba951 | Pending | — | — |
| discovery.apply | Apply filters | Примени филтри | edb1230c8a72 | Pending | — | — |
| discovery.beforeTime | Before | Пред | 7a016157b675 | Pending | — | — |
| discovery.clear | Clear search | Исчисти го пребарувањето | 9035c37a2f64 | Pending | — | — |
| discovery.describe | Describe the ride you need | Опиши каков превоз бараш | 51b6ac0d1d01 | Pending | — | — |
| discovery.empty | No rides match yet | Сè уште нема соодветен превоз | 190564eb962a | Pending | — | — |
| discovery.emptyBody | Try a wider search, or leave the date empty to see every upcoming ride. | Прошири го пребарувањето или остави го датумот празен за да ги видиш сите претстојни патувања. | bd30957e0b58 | Pending | — | — |
| discovery.filterHelp | Dates are optional. A from date alone selects one day; a through date includes that day. Times apply every day in Skopje time. If the end time is earlier, the window crosses midnight. | Датумите се незадолжителни. Со избор на само почетен датум, се избира еден ден; крајниот датум е вклучен во опсегот. Часовите важат секој ден според времето во Скопје. Ако крајниот час е порано, периодот продолжува по полноќ. | 0ce85879dce8 | Pending | — | — |
| discovery.filterLabel | Filter rides | Филтри за превоз | 991d4c306d82 | Pending | — | — |
| discovery.filters | Filter by city, date or time | Избери град, датум или време | b67ab3fb0b35 | Pending | — | — |
| discovery.fromDate | From date | Од датум | 09a0924b3ef7 | Pending | — | — |
| discovery.genderUnavailable | This filter needs a declared gender on your profile. Your profile does not have one, so all drivers are shown. | За овој филтер треба да наведеш пол на профилот. Бидејќи не е наведен, се прикажуваат сите возачи. | e8c5b4c26e8c | Pending | — | — |
| discovery.interpreting | Interpreting… | Се толкува… | 27103a88ffde | Pending | — | — |
| discovery.intro | A seat, some company, and a way home. | Слободно место, добро друштво и пат до дома. | 6f5b781eb61e | Pending | — | — |
| discovery.invalidResult | The search interpretation was invalid. Use the manual filters below. | Пребарувањето не е правилно протолкувано. Користи ги филтрите подолу. | 284b0fa3f206 | Pending | — | — |
| discovery.matches.one | {count} matching ride · Soonest departures first | {count} соодветно патување · Прво се прикажуваат најблиските поаѓања | d86834b499d9 | Pending | — | — |
| discovery.matches.other | {count} matching rides · Soonest departures first | {count} соодветни патувања · Прво се прикажуваат најблиските поаѓања | d4d26df12b21 | Pending | — | — |
| discovery.next | Your next ride | Твоето следно патување | 3f0b285092d0 | Pending | — | — |
| discovery.offline | AI search could not be reached. Use the manual filters below. | Нема врска со пребарувањето со вештачка интелигенција. Користи ги филтрите подолу. | 66ffc23fa5dd | Pending | — | — |
| discovery.optional | (optional) | (незадолжително) | 2af263e95110 | Pending | — | — |
| discovery.placeholder | Try “Skopje to Bitola tomorrow” | На пример „Скопје до Битола утре“ | 04f4716b9175 | Pending | — | — |
| discovery.reset | Reset | Исчисти | 86600df0e002 | Pending | — | — |
| discovery.sameGender | Same-gender drivers | Возачи од ист пол | 60b6f61447f6 | Pending | — | — |
| discovery.search | Search | Пребарај | 216458af8933 | Pending | — | — |
| discovery.shortQuery | Describe the ride you need in at least two characters. | Опиши каков превоз бараш со најмалку два знака. | 39c902415c3d | Pending | — | — |
| discovery.throughDate | Through date | До датум | 6eb09e47bb61 | Pending | — | — |
| discovery.title | Find a ride | Најди превоз | d72d22e24b08 | Pending | — | — |
| discovery.unavailable | AI search is unavailable. Use the manual filters below. | Пребарувањето со вештачка интелигенција е недостапно. Користи ги филтрите подолу. | cf35e50f66ef | Pending | — | — |
| discovery.welcome | Your profile is ready. Welcome aboard — find your first ride below. | Профилот е подготвен. Добредојде — најди го првото патување подолу. | 4550307b77e2 | Pending | — | — |
| estimate.assumptions | Assumes {fuelPrice} MKD/L, {tolls} in tolls and {emissions} kg CO₂ per litre. Potential savings assume every offered seat replaces one separate car on the same route. | Се претпоставуваат {fuelPrice} денари/L, {tolls} за патарини и {emissions} kg CO₂ по литар. Можната заштеда претпоставува дека секое понудено место заменува едно посебно возило на истата рута. | 535d2ee4e177 | Pending | — | — |
| estimate.co2 | Potential CO₂ saved | Можна заштеда на CO₂ | 5c29d2b81def | Pending | — | — |
| estimate.distance | Estimated route distance (km) | Проценето растојание на рутата (km) | 8e4b979fc29c | Pending | — | — |
| estimate.fuelCost | Fuel cost | Трошок за гориво | 478b71a15b29 | Pending | — | — |
| estimate.fuelTolls | Fuel + tolls | Гориво и патарини | f8ae09881189 | Pending | — | — |
| estimate.fuelUsed | Fuel used | Потрошено гориво | 49c1f0237aca | Pending | — | — |
| estimate.intro | Fuel and tolls are split across the offered passenger seats. The price remains editable. | Горивото и патарините се делат меѓу понудените места за патници. Цената можеш да ја промениш. | 31e1e1c195a9 | Pending | — | — |
| estimate.limit | This estimate exceeds the 3,000 MKD limit. Review the distance, consumption and tolls. | Проценката го надминува ограничувањето од 3.000 денари. Провери ги растојанието, потрошувачката и патарините. | a79045ab8dab | Pending | — | — |
| estimate.needSeats | Enter the number of available seats to get an estimate. | Внеси го бројот на слободни места за да добиеш проценка. | 964339d6ef44 | Pending | — | — |
| estimate.priceUnavailable | The fuel price estimate is unavailable right now. Enter your price per seat above. | Проценката на цената на горивото моментално не е достапна. Внеси цена по место погоре. | b81b42417257 | Pending | — | — |
| estimate.seat | Suggested seat | Предложена цена по место | c229f79a3a53 | Pending | — | — |
| estimate.title | Fair-price and CO₂ estimate | Проценка на разумна цена и CO₂ | 381b2114e964 | Pending | — | — |
| estimate.tolls | Tolls (MKD) | Патарини (денари) | 2034ebce8a8a | Pending | — | — |
| estimate.tollsLimit | 0–2,000 MKD for the whole trip | Од 0 до 2.000 денари за целото патување | fe23c01912e4 | Pending | — | — |
| estimate.unsupported | Automatic CO₂ estimates are currently available only for petrol and diesel cars. | Автоматската проценка на CO₂ засега е достапна само за возила на бензин и дизел. | b36d8599fcdc | Pending | — | — |
| estimate.use | Use {price} suggestion | Користи ја предложената цена од {price} | 489b5ae4c78f | Pending | — | — |
| explain.free.one | Matches your search: {origin} to {destination}; departs {date}; {count} seat available; free of charge. | Одговара на пребарувањето: {origin} до {destination}; поаѓање {date}; {count} слободно место; бесплатно. | 207aa92b51d7 | Pending | — | — |
| explain.free.other | Matches your search: {origin} to {destination}; departs {date}; {count} seats available; free of charge. | Одговара на пребарувањето: {origin} до {destination}; поаѓање {date}; {count} слободни места; бесплатно. | e1c417a54f02 | Pending | — | — |
| explain.paid.one | Matches your search: {origin} to {destination}; departs {date}; {count} seat available; {price} per seat. | Одговара на пребарувањето: {origin} до {destination}; поаѓање {date}; {count} слободно место; {price} по место. | 735e75d55c6e | Pending | — | — |
| explain.paid.other | Matches your search: {origin} to {destination}; departs {date}; {count} seats available; {price} per seat. | Одговара на пребарувањето: {origin} до {destination}; поаѓање {date}; {count} слободни места; {price} по место. | eb13412ef472 | Pending | — | — |
| form.anyone | Anyone | Сите | 259db1f4e25f | Pending | — | — |
| form.approveSeats | You approve each seat request. | Ти го одобруваш секое барање за место. | c4a440984d3b | Pending | — | — |
| form.car | Your car | Твоето возило | 2b07118688d5 | Pending | — | — |
| form.carFailed | We could not save your car. Please try again. | Возилото не можеше да се зачува. Обиди се повторно. | d37055be7ede | Pending | — | — |
| form.carInvalid | Review the car details and try again. | Провери ги податоците за возилото и обиди се повторно. | e871b133aeed | Pending | — | — |
| form.carSaveFailed | We could not save this car. Review its details and try again. | Возилото не можеше да се зачува. Провери ги податоците и обиди се повторно. | 3eff7c447292 | Pending | — | — |
| form.carSeats | Total passenger seats | Вкупно места за патници | 5b9cf3ff8412 | Pending | — | — |
| form.catalogEstimate | Catalog estimate: {value} L/100 km. Change it below if you know your car’s real consumption. | Проценка: {value} L/100 km. Промени ја подолу ако ја знаеш реалната потрошувачка на возилото. | fba4166fc430 | Pending | — | — |
| form.change | Change | Промени | 77f10931c0ee | Pending | — | — |
| form.chooseCar | Choose a car | Избери возило | f76e5054fded | Pending | — | — |
| form.chooseFuel | Choose fuel | Избери гориво | af4a1337108e | Pending | — | — |
| form.chooseModel | Choose a model | Избери модел | c6a736fd5bdd | Pending | — | — |
| form.city | Choose a city | Избери град | cb10dc352487 | Pending | — | — |
| form.color | Color (optional) | Боја (незадолжително) | 0bc3baecec6c | Pending | — | — |
| form.consumption | Consumption (L/100 km) | Потрошувачка (L/100 km) | 3575f93ad328 | Pending | — | — |
| form.decide | Decide with passengers | Договор со патниците | 681487d51312 | Pending | — | — |
| form.departure | Departure | Поаѓање | 60dc8f16cbfa | Pending | — | — |
| form.done | Done | Готово | 3d66d96f01d7 | Pending | — | — |
| form.draftSaved | Ride saved as a draft. | Превозот е зачуван како нацрт. | 6f7789880fe4 | Pending | — | — |
| form.dropoff | Drop-off point | Место за слегување | 92e31e1f74c4 | Pending | — | — |
| form.estimate | Estimate fuel costs & CO₂ savings | Процени трошоци за гориво и заштеда на CO₂ | 57796b1e0520 | Pending | — | — |
| form.findModel | Find model | Најди модел | 22eced1c3662 | Pending | — | — |
| form.free | Free | Бесплатно | f7be9bf38a71 | Pending | — | — |
| form.freeHint | Leave empty or enter 0 to offer the ride free of charge. | Остави празно или внеси 0 за да понудиш бесплатен превоз. | 0df75e8ecb6d | Pending | — | — |
| form.from | From | Од | c3398819487b | Pending | — | — |
| form.fuel | Fuel | Гориво | bd32f6cf259d | Pending | — | — |
| form.imported | Imported details are only a starting point. Confirm every field before saving or publishing this ride. | Увезените податоци се само почетна основа. Провери го секое поле пред да го зачуваш или објавиш превозот. | 218eecab1155 | Pending | — | — |
| form.incompleteDeparture | Recognized {value}. Complete the departure date and time. | Препознаено е {value}. Дополни ги датумот и времето на поаѓање. | 20d4055e895c | Pending | — | — |
| form.make | Make | Марка | 3603114aa5a4 | Pending | — | — |
| form.manual | Enter manually | Внеси рачно | 43ff242cdc69 | Pending | — | — |
| form.model | Model | Модел | 0e08d0fed856 | Pending | — | — |
| form.notes | Notes | Забелешки | dc02fb9dd100 | Pending | — | — |
| form.notesPlaceholder | Luggage, timing, or pickup details passengers should know | Багаж, време или место за качување што патниците треба да ги знаат | fa9ee2aede0f | Pending | — | — |
| form.notesTitle | Notes for passengers | Забелешки за патниците | 6d909c4cea67 | Pending | — | — |
| form.openingTrips | Opening My trips… | Се отвораат Моите патувања… | 89828cdc303a | Pending | — | — |
| form.optional | · optional | · незадолжително | bffd05b53d25 | Pending | — | — |
| form.passengers | Passengers | Патници | ec06f2c9f800 | Pending | — | — |
| form.pickup | Pickup point | Место за качување | 1ef924bde618 | Pending | — | — |
| form.pickups | Pickup & drop-off points | Места за качување и слегување | 59be172fdede | Pending | — | — |
| form.plate | Last 3 plate characters (optional) | Последни 3 знаци од регистрацијата (незадолжително) | a40824b49277 | Pending | — | — |
| form.plateHint | Exactly 3 letters or numbers | Точно 3 букви или бројки | 783ac5c47634 | Pending | — | — |
| form.preferences | Preferences | Желби за патувањето | dbc91db4cfb8 | Pending | — | — |
| form.price | Price per seat (MKD) | Цена по место (денари) | 64ad361ee99d | Pending | — | — |
| form.priceLimit | 0–3,000 MKD per seat; leave empty or enter 0 for a free ride | Од 0 до 3.000 денари по место; остави празно или внеси 0 за бесплатен превоз | 55cecca7d583 | Pending | — | — |
| form.publish | Publish ride | Објави превоз | 24d431a9c472 | Pending | — | — |
| form.published | Ride published. | Превозот е објавен. | daa1320b9288 | Pending | — | — |
| form.publishing | Publishing… | Се објавува… | a62edeb0608b | Pending | — | — |
| form.reuseCar | Save once and reuse on future rides. | Зачувај го возилото и користи го за следните патувања. | 2f5096293289 | Pending | — | — |
| form.reviewDeparture | Review the departure, available seats and vehicle details. | Провери го поаѓањето, слободните места и податоците за возилото. | 02fbe3a9c914 | Pending | — | — |
| form.reviewFields | Review the highlighted ride details. | Провери ги означените податоци за превозот. | c7ade86fef5c | Pending | — | — |
| form.ride | Your ride | Твоето патување | 2bc959b80016 | Pending | — | — |
| form.rideLegend | Ride | Патување | 363b20b93315 | Pending | — | — |
| form.sameGender | Same gender as me | Ист пол како мене | 84e31b70cfa0 | Pending | — | — |
| form.saveCar | Save car | Зачувај возило | b49f96fc3164 | Pending | — | — |
| form.saveDraft | Save draft | Зачувај нацрт | 6943a15646a4 | Pending | — | — |
| form.saveFailed | We could not save this ride. Retry; the same draft will not create a duplicate. | Превозот не можеше да се зачува. Обиди се повторно; истиот нацрт нема да создаде дупликат. | 9ea4b414aa67 | Pending | — | — |
| form.savedCar | Saved car | Зачувано возило | a91385a52727 | Pending | — | — |
| form.savedCarNotice | Car saved. It’s ready for this ride and future rides. | Возилото е зачувано. Можеш да го користиш за ова и за следните патувања. | 10c961223332 | Pending | — | — |
| form.savedCars | Your saved cars | Твоите зачувани возила | 6d96a34c3637 | Pending | — | — |
| form.saving | Saving… | Се зачувува… | 34d6319db92d | Pending | — | — |
| form.savingCar | Saving car… | Се зачувува возилото… | c2af47bb5eec | Pending | — | — |
| form.searchModels | Search models | Пребарај модели | c67b0cd6a909 | Pending | — | — |
| form.seats | Available seats | Слободни места | 876d8adce50a | Pending | — | — |
| form.seatsHint | Choose how many seats to offer for this ride | Избери колку места нудиш за ова патување | 080419b18c5b | Pending | — | — |
| form.selectionGone | A selected city, pickup point or car is no longer available. | Избраниот град, место за качување или возило повеќе не е достапно. | ec2d0af64904 | Pending | — | — |
| form.sessionExpired | Your session has expired. Sign in and try again. | Сесијата истече. Најави се и обиди се повторно. | 666152d1c5eb | Pending | — | — |
| form.timeZone | Departure is in Skopje local time. | Поаѓањето е според локалното време во Скопје. | 4b868a5d823b | Pending | — | — |
| form.to | To | До | 2292642f6370 | Pending | — | — |
| form.unavailableOwner | Your car or imported draft is unavailable for this account. Review the form. | Возилото или увезениот нацрт не е достапен за оваа сметка. Провери го формуларот. | 59aaeddfb346 | Pending | — | — |
| form.unconfirmed | The publication result could not be confirmed. Retry this draft. | Резултатот од објавувањето не можеше да се потврди. Обиди се повторно со овој нацрт. | bc43a57b102c | Pending | — | — |
| fuel.diesel | Diesel | Дизел | de7ada741239 | Pending | — | — |
| fuel.electric | Electric | Електрично | 36c49c0322ea | Pending | — | — |
| fuel.hybrid | Hybrid | Хибрид | a72b34e4a4b9 | Pending | — | — |
| fuel.lpg | LPG | Автогас | 8e338373d651 | Pending | — | — |
| fuel.other | Other | Друго | 223dba2494ee | Pending | — | — |
| fuel.petrol | Petrol | Бензин | 6ac5e84f0d6a | Pending | — | — |
| impact.air | CO₂ kept out of the air | CO₂ што не е испуштен во воздухот | d74071a4f5cc | Pending | — | — |
| impact.allRides | From every completed shared ride | Од сите завршени заеднички патувања | 25f195562757 | Pending | — | — |
| impact.assumption1 | Estimated savings assume each accepted passenger seat replaces a separate car making the same trip with the shared car's consumption. These are estimates, not measured emissions. | Проценетата заштеда претпоставува дека секое прифатено место за патник заменува посебно возило на истата рута, со иста потрошувачка како споделеното возило. Ова се проценки, а не измерени емисии. | 841d1f81502f | Pending | — | — |
| impact.assumption2 | Personal savings belong to passengers for their accepted seats. Drivers receive no additional credit for driving; each trip contributes once to the platform total. | Личната заштеда им се припишува на патниците за нивните прифатени места. Возачите не добиваат дополнителна заштеда за возењето; секое патување се брои еднаш во вкупната заштеда на платформата. | de163da055e4 | Pending | — | — |
| impact.assumption3 | Only departed, completed rides with accepted seats qualify. Petrol and diesel are supported; missing cars, invalid distance or consumption, and other fuels are excluded. | Се вклучуваат само завршени патувања со поминато поаѓање и прифатени места. Поддржани се бензин и дизел; се исклучуваат патувања без возило, со неважечко растојание или потрошувачка и со други горива. | c8bf6f9bf9f4 | Pending | — | — |
| impact.assumption4 | Calculations use currently stored trip and car data, not immutable history. Cancelling an accepted booking can reduce these totals. | Пресметките ги користат тековно зачуваните податоци за патувањето и возилото. Откажување на прифатена резервација може да ги намали вкупните износи. | b77dc7610aeb | Pending | — | — |
| impact.counted.one | {included} of {eligible} trip counted · {excluded} excluded | Вклучени се {included} од {eligible} патување · исклучени се {excluded} | bf3ae85f4a72 | Pending | — | — |
| impact.counted.other | {included} of {eligible} trips counted · {excluded} excluded | Вклучени се {included} од {eligible} патувања · исклучени се {excluded} | 1d83c9b6f897 | Pending | — | — |
| impact.how | How these estimates work | Како се пресметуваат проценките | eca90951696d | Pending | — | — |
| impact.intro | Estimated from completed rides where seats were shared. | Проценето од завршени патувања со споделени места. | 44f9b8491bdd | Pending | — | — |
| impact.loading | Loading impact summary… | Се вчитува прегледот на заштедите… | a4c04a1881a7 | Pending | — | — |
| impact.noData | Trips found, but none had enough data to estimate. | Пронајдени се патувања, но нема доволно податоци за проценка. | 033400862c32 | Pending | — | — |
| impact.none | No completed shared trips yet. | Сè уште немате завршени заеднички патувања. | a515d191be0d | Pending | — | — |
| impact.passenger | From rides you took as a passenger | Од патувањата во кои учествуваше како патник | 6172746b30da | Pending | — | — |
| impact.platform | Across the platform | На целата платформа | 25657ae70a4e | Pending | — | — |
| impact.title | Estimated CO₂ savings | Проценета заштеда на CO₂ | 5093bfd1dd03 | Pending | — | — |
| impact.unavailable | Impact estimates are unavailable right now. Reload this page to try again. | Проценките на заштедите моментално не се достапни. Освежи ја страницата за да се обидеш повторно. | c0218a646faf | Pending | — | — |
| impact.yours | Your savings | Твојата заштеда | 6f67b77efea0 | Pending | — | — |
| import.classification | Classification | Вид објава | 9312f04ccd81 | Pending | — | — |
| import.confidence | Confidence: {percent}% | Сигурност: {percent}% | 0faddcedf36d | Pending | — | — |
| import.continue | Continue to editable ride form | Продолжи кон формуларот за уредување | 3b5d4dc080bc | Pending | — | — |
| import.departure | Departure (Skopje time) | Поаѓање (време во Скопје) | 1d5337535cb4 | Pending | — | — |
| import.destination | Destination city | Град на пристигнување | b31bd311e09e | Pending | — | — |
| import.enterManually | Enter the ride manually | Внеси го превозот рачно | 4b901c6a7cb8 | Pending | — | — |
| import.facebook | Facebook screenshot | Слика од Facebook | bed7e8a0d3c7 | Pending | — | — |
| import.intro | Paste your post. Review the details before publishing. | Залепи ја објавата. Провери ги податоците пред објавување. | 7fed7d51ec43 | Pending | — | — |
| import.invalidDraft | The parser returned an invalid draft. Nothing was published. | Обработката врати неважечки нацрт. Ништо не е објавено. | aed3d1e782fa | Pending | — | — |
| import.kind.offer | Ride offer | Понуда за превоз | 764891504580 | Pending | — | — |
| import.kind.other | Other | Друго | 223dba2494ee | Pending | — | — |
| import.kind.request | Transport request | Барање за превоз | 56faff5091d3 | Pending | — | — |
| import.kind.unknown | Unknown | Непознато | cbb762c2ff0d | Pending | — | — |
| import.language.mixed | Mixed languages | Мешани јазици | 7ef98ec03c4d | Pending | — | — |
| import.language.mk | Macedonian | Македонски | 6bf0e5732204 | Pending | — | — |
| import.language.sq | Albanian | Албански | f3c4fd764cd9 | Pending | — | — |
| import.language.unknown | Unknown language | Непознат јазик | bde5ab2d7d3b | Pending | — | — |
| import.manual | Create a ride manually | Внеси превоз рачно | b2247d8549b4 | Pending | — | — |
| import.method | Import method | Начин на увезување | cd4f33c1793e | Pending | — | — |
| import.needsReview | Needs review | Потребна е проверка | 80a643fffe1d | Pending | — | — |
| import.noPost | No post to import? | Немаш објава за увезување? | 7e69b1ef4489 | Pending | — | — |
| import.offline | The parser could not be reached. Try again or create the ride manually. | Обработката не е достапна. Обиди се повторно или внеси го превозот рачно. | 9d225271fe1f | Pending | — | — |
| import.origin | Departure city | Град на поаѓање | bdd834518c0a | Pending | — | — |
| import.parseFailed | The post could not be parsed. | Објавата не можеше да се обработи. | 0b8a95c5289f | Pending | — | — |
| import.parsing | Parsing… | Се обработува… | 7cd0b864b3bd | Pending | — | — |
| import.placeholder | Имам 3 слободни места од Скопје за Битола… | Имам 3 слободни места од Скопје за Битола… | c04861c28d7d | Pending | — | — |
| import.price | Price per seat | Цена по место | 2ed06ef266ea | Pending | — | — |
| import.priceNotStated | Not stated (free unless you add one) | Не е наведена (бесплатно ако не внесеш цена) | 8938b476ed63 | Pending | — | — |
| import.requestWarning | This looks like a request for transport, not an offered ride. Confirm before continuing. | Ова изгледа како барање за превоз, а не понуда. Провери пред да продолжиш. | be684d8820c2 | Pending | — | — |
| import.review | Review the extracted details | Провери ги извлечените податоци | c0a0bbe34f42 | Pending | — | — |
| import.reviewDraft | Create review draft | Создај нацрт за проверка | 0e5f8d234833 | Pending | — | — |
| import.seats | Seats | Места | fb9267995c36 | Pending | — | — |
| import.text | Post text | Текст на објавата | c93c2604cc53 | Pending | — | — |
| import.title | Import a ride post | Увези објава за превоз | 78ba75198ab9 | Pending | — | — |
| import.viber | Viber text | Текст од Viber | 6a3641f6de55 | Pending | — | — |
| landing.co2 | Est. CO₂ saved | Проценета заштеда на CO₂ | 960d8f4273d7 | Pending | — | — |
| landing.completed | Shared trips completed | Заеднички патувања | 7ec5aea8a58c | Pending | — | — |
| landing.excluded.one | {count} completed shared trip excluded from savings estimates because vehicle or distance data is missing or unsupported. | {count} завршено заедничко патување не е вклучено во проценетите заштеди поради недостасувачки или неподдржани податоци за возилото или растојанието. | 190ca0f1798f | Pending | — | — |
| landing.excluded.other | {count} completed shared trips excluded from savings estimates because vehicle or distance data is missing or unsupported. | {count} завршени заеднички патувања не се вклучени во проценетите заштеди поради недостасувачки или неподдржани податоци за возилото или растојанието. | 3e38e7aeed83 | Pending | — | — |
| landing.from | From | Од | c3398819487b | Pending | — | — |
| landing.fuel | Est. fuel saved | Проценета заштеда на гориво | c9364fe75954 | Pending | — | — |
| landing.going | Going to | Каде одиш? | 7ec9bd57760b | Pending | — | — |
| landing.greener | Greener. | Позелено. | 40aec01c6338 | Pending | — | — |
| landing.intro | Fill the empty seats on your way home. Split the fuel, meet other students, and leave a smaller footprint on every trip. | Пополни ги слободните седишта на патот до дома. Подели ги трошоците за гориво, запознај други студенти и намали го загадувањето со секое патување. | 6ddb034cc14d | Pending | — | — |
| landing.lake | Lake Ohrid | Охридско Езеро | 011963d5d550 | Pending | — | — |
| landing.leaving | Leaving from | Од каде поаѓаш? | 98beed51dab8 | Pending | — | — |
| landing.loadingCities | Loading cities… | Се вчитуваат градовите… | 193cec9bc69b | Pending | — | — |
| landing.ohrid | Ohrid | Охрид | 479a86005900 | Pending | — | — |
| landing.participants | Unique participants | Корисници | 27bd20cea042 | Pending | — | — |
| landing.pickedUp | +2 riders picked up | +2 патници се приклучија | a91f44cfc78a | Pending | — | — |
| landing.quickerCheaper | Quicker. Cheaper. | Побрзо. Поевтино. | 8d4c72ffba9a | Pending | — | — |
| landing.rideHome | Your ride home. | Твојот превоз до дома. | 6e6196da8a65 | Pending | — | — |
| landing.sharedSaving | A shared trip saves about 21 kg of CO₂. | Заедничкото патување заштедува околу 21 kg CO₂. | 3a26a8e03f12 | Pending | — | — |
| landing.skopje | Skopje | Скопје | befbed4be88c | Pending | — | — |
| landing.statistics | Community trip statistics | Податоци за заедничките патувања | 68df1154a14c | Pending | — | — |
| landing.statisticsLoading | Loading trip statistics… | Се вчитуваат податоците за патувањата… | 7b64b362156d | Pending | — | — |
| landing.statisticsUnavailable | Trip statistics are temporarily unavailable. | Податоците за патувањата привремено не се достапни. | bf8c1fdb6236 | Pending | — | — |
| landing.swap | Swap departure and destination | Замени ги местата на поаѓање и пристигнување | e2e0fd02135f | Pending | — | — |
| landing.title | A little closer, together | Поблиску, заедно | bbcdb80de20a | Pending | — | — |
| landing.to | To | До | 2292642f6370 | Pending | — | — |
| landing.where | Where to? | Каде патуваш? | 01a32faf79f9 | Pending | — | — |
| loading.chat | Loading ride room… | Се вчитува разговорот за патувањето… | 09a5ebc51f3b | Pending | — | — |
| loading.form | Loading form… | Се вчитува формуларот… | c2f70c3e6a26 | Pending | — | — |
| loading.itinerary | Loading shared itinerary… | Се вчитува споделениот план за патување… | 1aba46b74d04 | Pending | — | — |
| loading.login | Loading sign in… | Се вчитува најавата… | ad386edde408 | Pending | — | — |
| loading.offer | Loading ride form… | Се вчитува формуларот за превоз… | c712b2a23db0 | Pending | — | — |
| loading.profile | Loading profile… | Се вчитува профилот… | 78e9a3d24e42 | Pending | — | — |
| loading.ride | Loading ride… | Се вчитува патувањето… | e18ffd5847ab | Pending | — | — |
| loading.rides | Loading rides… | Се вчитуваат понудите за превоз… | 44f946356388 | Pending | — | — |
| locale.failed | Could not change language. Please try again. | Јазикот не може да се промени. Обидете се повторно. | ce8c59300b5f | Pending | — | — |
| locale.label | Language | Јазик | 1a3361069852 | Pending | — | — |
| locale.saving | Changing language… | Се менува јазикот… | 8156b0691848 | Pending | — | — |
| locale.switch | Switch language | Промени јазик | 32974f444d73 | Pending | — | — |
| nav.about | About | За нас | ca647ed5614d | Pending | — | — |
| nav.close | Close menu | Затвори мени | 0bc785b376c5 | Pending | — | — |
| nav.copyright | © {year} ajde. Made in Skopje. | © {year} ajde. Создадено во Скопје. | 2b7618fd5a44 | Pending | — | — |
| nav.find | Find a ride | Најди превоз | d72d22e24b08 | Pending | — | — |
| nav.footer | Footer | Мени на дното на страницата | ccb8498c6b09 | Pending | — | — |
| nav.home | ajde home | ajde — почетна страница | 0963a9c368f8 | Pending | — | — |
| nav.main | Main navigation | Главно мени | ee85e968fd0b | Pending | — | — |
| nav.offer | Offer a ride | Понуди превоз | f70b3c270f0b | Pending | — | — |
| nav.open | Open menu | Отвори мени | 931c5df42c3d | Pending | — | — |
| nav.profile | Profile | Профил | 5686c1a95393 | Pending | — | — |
| nav.signIn | Sign in | Најави се | fa56b045464c | Pending | — | — |
| nav.signOut | Sign out | Одјави се | 1840dc28423f | Pending | — | — |
| nav.signUp | Sign up | Регистрирај се | 2b385247bc2c | Pending | — | — |
| nav.skip | Skip to content | Прескокни до содржината | 88133456d2fa | Pending | — | — |
| nav.trips | My trips | Мои патувања | 8d81cc367d19 | Pending | — | — |
| offer.allSaved | All rides saved. Opening My trips… | Сите патувања се зачувани. Се отвораат Моите патувања… | 0f48fbe3f915 | Pending | — | — |
| offer.chooseDestination | choose destination | избери одредиште | e0aed6b4b32d | Pending | — | — |
| offer.deleteDraft | Delete draft: {label} | Избриши нацрт: {label} | fe9ed212d176 | Pending | — | — |
| offer.deleteDraftTitle | Delete draft | Избриши нацрт | 00dc6020df59 | Pending | — | — |
| offer.describe | Describe your rides | Опиши ги патувањата | 64557d07c866 | Pending | — | — |
| offer.describeHint | Write it like a message and AI fills in the form for you. Or enter the details below. | Напиши го описот како порака и автоматски ќе се пополни формуларот. Можеш и рачно да ги внесеш податоците подолу. | 7f60593b340a | Pending | — | — |
| offer.descriptionChanged | The description changed. Retry to apply the new text. | Описот е променет. Обиди се повторно за да се примени новиот текст. | b54b55e3312a | Pending | — | — |
| offer.distanceCalculating | Calculating city-to-city road distance… | Се пресметува патното растојание меѓу градовите… | 41da793e56af | Pending | — | — |
| offer.distanceFilled | Estimated city-to-city driving distance filled. | Проценетото патно растојание меѓу градовите е пополнето. | 8b44d5764e36 | Pending | — | — |
| offer.distanceUnavailable | Distance unavailable. Enter km manually or retry. | Растојанието не е достапно. Внеси километри рачно или обиди се повторно. | 71773a79ceb3 | Pending | — | — |
| offer.draftDeleted | Draft deleted. | Нацртот е избришан. | 1b0f747b5db1 | Pending | — | — |
| offer.draftTabs | Ride drafts | Нацрти за превоз | ed82230a0154 | Pending | — | — |
| offer.draftsCleared | Drafts cleared. Edit your description and fill the form again. | Нацртите се исчистени. Уреди го описот и повторно пополни го формуларот. | 5cf494ea247a | Pending | — | — |
| offer.draftsRestored | Drafts restored. | Нацртите се вратени. | f017887a305c | Pending | — | — |
| offer.estimateCaveat | Estimates may differ from your journey. | Проценките може да се разликуваат од твоето патување. | 4b792772ea81 | Pending | — | — |
| offer.fill | Fill form | Пополни формулар | 7d147e591198 | Pending | — | — |
| offer.filled | Details filled. Edit the form directly and review each ride before publishing. | Податоците се пополнети. Уреди го формуларот и провери го секое патување пред објавување. | a4733015bcb1 | Pending | — | — |
| offer.filling | Filling… | Се пополнува… | 0ee23d970e07 | Pending | — | — |
| offer.fixMap | Fix the map | Поправи ја картата | 36192583c3ea | Pending | — | — |
| offer.formChanged | The form changed. Retry to apply your description. | Формуларот е променет. Обиди се повторно за да се примени описот. | 9ee737ea349a | Pending | — | — |
| offer.importHint | Paste your Facebook or Viber post and we’ll turn it into a ride. | Префрли ја објавата од Facebook или Viber и ќе ја претвориме во понуда за превоз. | 911bbcda6149 | Pending | — | — |
| offer.importLink | Import your post | Поднеси ја објавата | 233025ae1904 | Pending | — | — |
| offer.importTitle | Already posted in a group? | Веќе имаш објава во група? | 6898dced3e18 | Pending | — | — |
| offer.interpretFailed | Interpretation failed. Retry or complete the form manually. | Описот не можеше да се обработи. Обиди се повторно или рачно пополни го формуларот. | 04f252691d1c | Pending | — | — |
| offer.intro | Set your route, choose your car, and offer a seat. | Одреди ја рутата, избери возило и понуди слободно место. | b489db3d2311 | Pending | — | — |
| offer.mapCredit | Map data © OpenStreetMap contributors. | Податоци за картата © соработниците на OpenStreetMap. | cd24140f7257 | Pending | — | — |
| offer.placeholder | e.g. Going Skopje to Bitola 4pm Saturday in my Clio, 3 seats, back Sunday evening | На пример: Во сабота во 16 часот одам од Скопје до Битола со Клио, имам 3 слободни места, се враќам во недела навечер | ed2f78419b33 | Pending | — | — |
| offer.previousRestored | Previous draft restored. | Претходниот нацрт е вратен. | 85408fa4273e | Pending | — | — |
| offer.publishFailed | Publication failed. Please retry. | Објавувањето не успеа. Обиди се повторно. | c14cac4cf146 | Pending | — | — |
| offer.publishedContinue | Ride published. Continue with your remaining drafts. | Превозот е објавен. Продолжи со преостанатите нацрти. | 89d922723e0c | Pending | — | — |
| offer.restoreFailed | Saved drafts could not be restored. You can still complete the form manually. | Зачуваните нацрти не можеа да се вратат. Можеш рачно да го пополниш формуларот. | 6aa8c3b9bf4f | Pending | — | — |
| offer.restored | Your ride drafts were restored for this session. | Нацртите за превоз се вратени за оваа сесија. | 2ab13b3cb626 | Pending | — | — |
| offer.restoring | Restoring ride drafts… | Се враќаат нацртите за превоз… | 353b3990f511 | Pending | — | — |
| offer.retry | Retry | Обиди се повторно | 39495d94e06d | Pending | — | — |
| offer.retryDistance | Retry distance | Повтори го пресметувањето на растојанието | 6a623ab40515 | Pending | — | — |
| offer.reviewBeforePublish | Review the details below before publishing. | Провери ги податоците подолу пред објавување. | 293fe3ea7305 | Pending | — | — |
| offer.reviewDetails | Review these details: | Провери ги овие податоци: | f23edbc52a93 | Pending | — | — |
| offer.rideNumber | Ride {number} | Патување {number} | 348e407bee06 | Pending | — | — |
| offer.routingCredit | City-to-city routing by OSRM. | Рутите меѓу градовите ги обезбедува OSRM. | d23812237130 | Pending | — | — |
| offer.savedContinue | Ride saved as a draft. Continue with your remaining drafts. | Превозот е зачуван како нацрт. Продолжи со преостанатите нацрти. | c42c197285de | Pending | — | — |
| offer.savedSession | Saved for this session | Зачувано за оваа сесија | e509d30aff7c | Pending | — | — |
| offer.sessionUnavailable | Session recovery is unavailable. Keep this page open until you publish. | Враќањето на нацртите не е достапно. Остави ја страницата отворена додека не го објавиш превозот. | b7c4790e998a | Pending | — | — |
| offer.startOver | Start over | Почни одново | eb4ed8677537 | Pending | — | — |
| offer.tabLabel | {origin} to {destination} {departure} | {origin} до {destination} {departure} | 4b1407f95c7a | Pending | — | — |
| offer.title | Offer a ride | Понуди превоз | f70b3c270f0b | Pending | — | — |
| offer.undo | Undo | Врати | 2f43458a31dc | Pending | — | — |
| offer.undoFill | Undo fill | Врати го пополнувањето | bd66b9a58202 | Pending | — | — |
| offer.warning.ambiguous | An interpreted detail is ambiguous. Check the form before publishing. | Еден податок од описот е двосмислен. Провери го формуларот пред објавување. | aa208a692cc1 | Pending | — | — |
| offer.warning.carModel | Choose a currently available car model. | Избери модел на возило што е достапен. | ca7609fabacd | Pending | — | — |
| offer.warning.departurePassed | The recovered departure has passed. Choose a future time. | Времето на поаѓање од вратениот нацрт е поминато. Избери идно време. | 65e33d28f662 | Pending | — | — |
| offer.warning.low_confidence | An interpreted detail may be inaccurate. Check the form before publishing. | Еден податок од описот можеби не е точен. Провери го формуларот пред објавување. | eddc1e816364 | Pending | — | — |
| offer.warning.missing | A detail could not be found. Complete the form before publishing. | Еден податок не беше пронајден. Дополни го формуларот пред објавување. | d89db84cf1bc | Pending | — | — |
| offer.warning.needs_review | A detail needs review. Check the form before publishing. | Еден податок треба да се провери. Провери го формуларот пред објавување. | ba8a91e38845 | Pending | — | — |
| offer.warning.savedCar | Choose a currently available saved car. | Избери зачувано возило што е достапно. | 65086278bd8d | Pending | — | — |
| offer.warning.savedCity | A saved city is no longer available. Choose it again. | Зачуваниот град повеќе не е достапен. Избери го повторно. | d65a1b047ac3 | Pending | — | — |
| offer.warning.unsupported | A detail could not be interpreted. Complete the form manually. | Еден податок не можеше да се протолкува. Дополни го формуларот рачно. | 8feda183ff69 | Pending | — | — |
| onboarding.bio | Bio (optional) | Биографија (незадолжително) | 55909b523f7f | Pending | — | — |
| onboarding.bioHelp | A short introduction for your fellow travellers. Up to 500 characters. | Кратко претставување за твоите сопатници. Најмногу 500 знаци. | b72db4201d0d | Pending | — | — |
| onboarding.bioLength | Bio must be 500 characters or fewer. | Биографијата може да содржи најмногу 500 знаци. | fe8683229843 | Pending | — | — |
| onboarding.bioPlaceholder | What are you studying? Where do you usually travel? | Што студираш? Каде обично патуваш? | fab27f2cc1cb | Pending | — | — |
| onboarding.chooseGender | Choose an option | Избери опција | f0a703156df9 | Pending | — | — |
| onboarding.failed | We could not finish your profile. Check your connection and try again. | Профилот не може да се доврши. Провери ја врската и обиди се повторно. | b5f705304967 | Pending | — | — |
| onboarding.female | Female | Женски | 9c5c4f1a18b5 | Pending | — | — |
| onboarding.gender | Gender (optional) | Пол (незадолжително) | 85db27025591 | Pending | — | — |
| onboarding.genderHelp | Shown on your profile and used for same-gender ride preferences. You can leave this blank. | Се прикажува на профилот и се користи при избор на превоз со лица од ист пол. Можеш да го оставиш празно. | 2e05828325fb | Pending | — | — |
| onboarding.heading | A face to go with the name. | Запознај ги сопатниците и со лик. | 5292f6d00701 | Pending | — | — |
| onboarding.intro | Help fellow students recognise you at pickup. | Помогни им на другите студенти да те препознаат на местото на поаѓање. | e2c5b5a13f07 | Pending | — | — |
| onboarding.invalidGender | Choose a valid gender option. | Избери важечка опција за пол. | 7b5e2a180fc4 | Pending | — | — |
| onboarding.invalidInput | Check your profile details and try again. | Провери ги податоците за профилот и обиди се повторно. | b89f94245a62 | Pending | — | — |
| onboarding.male | Male | Машки | 1347020f576f | Pending | — | — |
| onboarding.name | Full name | Име и презиме | 78c74b965083 | Pending | — | — |
| onboarding.nameLength | Enter a name between 2 and 100 characters. | Внеси име со должина од 2 до 100 знаци. | 112c68eef84e | Pending | — | — |
| onboarding.namePlaceholder | Your first and last name | Твоето име и презиме | b7653a4c26f2 | Pending | — | — |
| onboarding.phone | Phone number | Телефонски број | 64d2c8aac716 | Pending | — | — |
| onboarding.phoneHelp | Shared with a driver when you request a seat and with fellow members of your ride room. | Видлив за возачот кога ќе побараш место и за членовите на собата за разговор за патувањето. | 7cbbdb4cd3e6 | Pending | — | — |
| onboarding.phonePlaceholder | e.g. +389 70 123 456 | на пр. +389 70 123 456 | 008f737b2df4 | Pending | — | — |
| onboarding.photo | Profile photo | Профилна фотографија | f3876f4e9d0d | Pending | — | — |
| onboarding.photoHelp | A clear photo of you. JPEG, PNG, or WebP, up to 5 MB. | Јасна фотографија од тебе. JPEG, PNG или WebP, до 5 MB. | 4c67636a2fd2 | Pending | — | — |
| onboarding.photoOwner | Upload a profile photo owned by your account. | Прикачи профилна фотографија што припаѓа на твојата сметка. | 443a6d22d0c1 | Pending | — | — |
| onboarding.photoRequired | Add a profile photo to continue. | Додај профилна фотографија за да продолжиш. | 42cb1934d4fb | Pending | — | — |
| onboarding.photoSize | The profile photo must be 5 MB or smaller. | Профилната фотографија мора да биде до 5 MB. | 0d3f006b8bcf | Pending | — | — |
| onboarding.photoType | Choose a JPEG, PNG, or WebP image. | Избери фотографија во JPEG, PNG или WebP формат. | 2d13b9eb39b5 | Pending | — | — |
| onboarding.preview | Selected profile preview | Преглед на избраната профилна фотографија | e817e086b7ee | Pending | — | — |
| onboarding.privacy | Your name, photo and university are visible to other students. Your phone is shared with drivers when you request a seat. Your phone and optional social link are visible to fellow members in accepted ride rooms. | Твоето име, фотографија и универзитет се видливи за другите студенти. Возачот го гледа твојот телефон кога ќе побараш место во автомобилот. Телефонот и профилот на социјалните мрежи се видливи за членовите на собата за разговор по прифаќањето. | 557cc7bb48f4 | Pending | — | — |
| onboarding.progress | Signup progress | Чекори за регистрација | badd7d042bcd | Pending | — | — |
| onboarding.required | Fields marked * are required. | Полињата означени со * се задолжителни. | 446ff00dbd43 | Pending | — | — |
| onboarding.saveFailed | Your profile could not be saved. Please try again. | Профилот не може да се зачува. Обиди се повторно. | b266d2140487 | Pending | — | — |
| onboarding.saving | Creating profile… | Се создава профилот… | bab24a8b1124 | Pending | — | — |
| onboarding.social | Social profile (optional) | Профил на друштвена мрежа (незадолжително) | d125531c15e8 | Pending | — | — |
| onboarding.socialHelp | Facebook, Instagram, X, or another HTTPS profile link. Visible to members of your ride room. | Facebook, Instagram, X или друга HTTPS врска до профил. Видлива за членовите на собата за разговор за патувањето. | a2f1da57cfd4 | Pending | — | — |
| onboarding.submit | Complete profile & find a ride | Дополни го профилот и најди превоз | 7abf3ebad162 | Pending | — | — |
| onboarding.title | Complete your profile | Дополни го профилот | f77c88689f88 | Pending | — | — |
| onboarding.trusted | Your trusted profile | Профил што влева доверба | 2c6b6807d953 | Pending | — | — |
| onboarding.university | University | Универзитет | c412a355276a | Pending | — | — |
| onboarding.universityLength | Enter a university between 2 and 160 characters. | Внеси универзитет со должина од 2 до 160 знаци. | 62dfb4f3ab7a | Pending | — | — |
| onboarding.universityPlaceholder | e.g. UKIM · FINKI | на пр. УКИМ · ФИНКИ | 3429b5d2d1cf | Pending | — | — |
| onboarding.uploadFailed | The photo could not be uploaded. Please try again. | Фотографијата не може да се прикачи. Обиди се повторно. | 060a2a5c02af | Pending | — | — |
| onboarding.verified | Student email verified | Студентската е-пошта е потврдена | 1757cbaa281a | Pending | — | — |
| profile.about | About | За мене | 2f2bec29a97e | Pending | — | — |
| profile.back | Back to rides | Назад кон превозите | b38f8e7b7dcc | Pending | — | — |
| profile.connectionError | Connection error | Проблем со врската | 1fd776af641d | Pending | — | — |
| profile.edit | Edit profile & contacts | Уреди профил и информации за контакт | 11d73bf5a896 | Pending | — | — |
| profile.gender | Gender | Пол | 94829103f2ff | Pending | — | — |
| profile.gender.man | Man | Маж | 0d18f7176a1c | Pending | — | — |
| profile.gender.non_binary | Non-binary | Небинарно | b47ef87ecb8e | Pending | — | — |
| profile.gender.prefer_not_to_say | Prefer not to say | Не сакам да наведам | dd33dd322fe1 | Pending | — | — |
| profile.gender.woman | Woman | Жена | 210de4cc388e | Pending | — | — |
| profile.label | Profile | Профил | 5686c1a95393 | Pending | — | — |
| profile.loadFailed | The profile did not load | Профилот не може да се вчита | af0e1b99564c | Pending | — | — |
| profile.noBio | This student hasn’t added a bio yet. | Овој студент сè уште нема додадено опис. | d55ad7f93666 | Pending | — | — |
| profile.notFound | Student not found | Студентот не е пронајден | 6f433355e7df | Pending | — | — |
| profile.notFoundBody | This profile may not exist yet, or it may no longer be available. | Овој профил можеби сè уште не постои или веќе не е достапен. | 3c2ba1f8bc41 | Pending | — | — |
| profile.photo | {name}’s profile photo | Профилна фотографија на {name} | 0f9b4b14af18 | Pending | — | — |
| profile.privacy | Phone numbers are shared with drivers receiving a booking request. Ride-room members can see each other’s contact details. | Телефонските броеви се споделуваат со возачите што добиваат барање за место. Учесниците во разговорот за патувањето ги гледаат меѓусебните податоци за контакт. | c26ed6a341fc | Pending | — | — |
| profile.unavailable | The service may be temporarily unavailable. Your session and data are safe. | Услугата можеби е привремено недостапна. Твојата сесија и податоци се зачувани. | 61fa4c5f8fb6 | Pending | — | — |
| rating.afterCompleted | They appear after completed shared rides. | Оценките се појавуваат по завршени заеднички патувања. | 5ad1e28909ae | Pending | — | — |
| rating.already | You have already rated this person for this ride. Refresh to see your feedback. | Веќе го оцени ова лице за ова патување. Освежи ја страницата за да ја видиш оценката. | 65abc5898476 | Pending | — | — |
| rating.based.one | Based on {count} completed-ride rating | Врз основа на {count} оценка за завршено патување | c10c982932c5 | Pending | — | — |
| rating.based.other | Based on {count} completed-ride ratings | Врз основа на {count} оценки за завршени патувања | 02738a641977 | Pending | — | — |
| rating.eligibilityFailed | Could not check rating eligibility. Please try again. | Не можеше да се провери дали можеш да оценуваш. Обиди се повторно. | c97405e2c40f | Pending | — | — |
| rating.excellent | Excellent | Одлично | 7702bc402dab | Pending | — | — |
| rating.fair | Fair | Доволно | 31614370812b | Pending | — | — |
| rating.feedback | Completed-ride feedback | Оценка за завршено патување | 72b0e9b0cbf3 | Pending | — | — |
| rating.good | Good | Добро | 81b1831a57ef | Pending | — | — |
| rating.immutable | Ratings cannot be edited or deleted. | Оценките не може да се менуваат или бришат. | 9f1e4595c457 | Pending | — | — |
| rating.ineligible | You can only rate your driver or accepted passenger after the ride is completed. | Можеш да го оцениш возачот или прифатен патник само по завршувањето на патувањето. | 70f4c0b88a58 | Pending | — | — |
| rating.invalid | Choose a score from 1 to 5 and keep feedback within 1000 characters. | Избери оценка од 1 до 5 и коментар до 1.000 знаци. | 41eac7d523f3 | Pending | — | — |
| rating.none | No ratings yet | Сè уште нема оценки | 76ee352b3eca | Pending | — | — |
| rating.note | Private feedback (optional, up to 1000 characters) | Приватен коментар (незадолжително, до 1.000 знаци) | e2ad39d14ba8 | Pending | — | — |
| rating.option.one | {count} star, {label} | {count} ѕвезда, {label} | 0a9fe7d2840d | Pending | — | — |
| rating.option.other | {count} stars, {label} | {count} ѕвезди, {label} | 4c42fdbf1e81 | Pending | — | — |
| rating.poor | Poor | Лошо | 05c87841ac1e | Pending | — | — |
| rating.privacy | Your score contributes to their public profile average. Written feedback is visible only to you and this person. You can submit once per person for this ride. | Твојата оценка влегува во јавниот просек на профилот. Пишаниот коментар е видлив само за тебе и за ова лице. Можеш да оцениш секое лице само еднаш за ова патување. | e9d662d05071 | Pending | — | — |
| rating.private | Your private feedback | Твојот приватен коментар | bb8752dfdcc7 | Pending | — | — |
| rating.rate | Rate {name} | Оцени го/ја {name} | beaff7ea92a5 | Pending | — | — |
| rating.saveFailed | Your rating could not be saved. Please refresh and try again. | Оценката не можеше да се зачува. Освежи ја страницата и обиди се повторно. | 6077497e25c7 | Pending | — | — |
| rating.saved | Rating submitted. Thank you for your feedback. | Оценката е испратена. Ти благодариме за коментарот. | f9ffff59df14 | Pending | — | — |
| rating.saving | Saving rating… | Се зачувува оценката… | 2301abe9d030 | Pending | — | — |
| rating.savingStatus | Saving your rating | Се зачувува твојата оценка | 62b43dae7ec5 | Pending | — | — |
| rating.scoreFor | Score for {name} | Оценка за {name} | ef1fcd72465a | Pending | — | — |
| rating.signIn | Sign in to rate a completed ride. | Најави се за да оцениш завршено патување. | f467743597d7 | Pending | — | — |
| rating.stars | {score} out of 5 stars | {score} од 5 ѕвезди | 1ec1bde8f3ef | Pending | — | — |
| rating.submit | Submit rating | Испрати оценка | 22a445861e31 | Pending | — | — |
| rating.tap | Tap a star to rate | Избери ѕвезда за да оцениш | 772ed41048a5 | Pending | — | — |
| rating.title | Ride rating | Оценка за патувањата | 38597fc56e74 | Pending | — | — |
| rating.unavailable | The rating summary is unavailable right now. Try again in a moment. | Прегледот на оценките моментално не е достапен. Обиди се повторно наскоро. | 0684cdff92cf | Pending | — | — |
| rating.veryGood | Very good | Многу добро | ee216d02ee7b | Pending | — | — |
| rating.with | Rate your ride with {name} | Оцени го патувањето со {name} | 355fa4477c36 | Pending | — | — |
| rating.yours | Your rating | Твојата оценка | 94ea79dd73e3 | Pending | — | — |
| ride.agreeDropoff | Agree drop-off with driver | Договори го местото на пристигнување со возачот | fd2a4fcf911b | Pending | — | — |
| ride.agreePickup | Agree pickup with driver | Договори го местото на поаѓање со возачот | 35d2dc6a3218 | Pending | — | — |
| ride.arrange | Arrange with driver | Договор со возачот | 982b656d6e84 | Pending | — | — |
| ride.arrangeBoth | Pickup & drop-off arranged with driver | Местата за поаѓање и пристигнување се договараат со возачот | 12d8b5091c7a | Pending | — | — |
| ride.choose | Choose ride | Избери превоз | e76c289fb16f | Pending | — | — |
| ride.departure | Departure | Поаѓање | 60dc8f16cbfa | Pending | — | — |
| ride.departureTime | {date}, Skopje time | {date}, време во Скопје | 2608642eff5f | Pending | — | — |
| ride.destination | Destination | Пристигнување | b5692c44321e | Pending | — | — |
| ride.driverSoon | Driver details coming soon | Податоците за возачот ќе бидат достапни наскоро | 15b3a6e6e587 | Pending | — | — |
| ride.dropoff | Drop-off: | Пристигнување: | d51915dd96e2 | Pending | — | — |
| ride.free | Free | Бесплатно | f7be9bf38a71 | Pending | — | — |
| ride.full | Full | Пополнето | 3092f30178ca | Pending | — | — |
| ride.imported | Imported ride | Увезено патување | 39973e76ece8 | Pending | — | — |
| ride.noCharge | no charge | без надомест | eccdb8410981 | Pending | — | — |
| ride.perSeat | per seat | по место | 7dfff470a93a | Pending | — | — |
| ride.pickup | Pickup: | Поаѓање: | e5ea2866c7de | Pending | — | — |
| ride.route | {origin} to {destination} | {origin} до {destination} | 1dab1bd6a80d | Pending | — | — |
| ride.seats | {available} of {total} seats available | Слободни места: {available} од {total} | 06f799f804d2 | Pending | — | — |
| ride.seatsLeft.one | {count} seat left | Уште {count} слободно место | 9f28cdd006e1 | Pending | — | — |
| ride.seatsLeft.other | {count} seats left | Уште {count} слободни места | 2ae21bfe2c98 | Pending | — | — |
| ride.time | Skopje time | Време во Скопје | cc92c9dc7567 | Pending | — | — |
| ride.to | to | до | 6d04fce707cc | Pending | — | — |
| ride.verified | Verified driver | Потврден возач | 9dc62e8f3d26 | Pending | — | — |
| ride.view | View ride from {origin} to {destination} | Погледни го превозот од {origin} до {destination} | 3fe5fc9b64c0 | Pending | — | — |
| screenshot.choose | Choose a screenshot | Избери слика од екранот | 8f78a5d4ac59 | Pending | — | — |
| screenshot.chooseAnother | Choose another screenshot | Избери друга слика | 3e7f6423b083 | Pending | — | — |
| screenshot.choosePost | Choose a detected post | Избери пронајдена објава | 1a35b37f5f3f | Pending | — | — |
| screenshot.detected | Detected posts | Пронајдени објави | 89ad0502cabc | Pending | — | — |
| screenshot.drop | or drag and drop it here | или повлечи ја и пушти ја тука | a6163f7ed975 | Pending | — | — |
| screenshot.fileInvalid | Choose one PNG, JPEG, or WebP screenshot up to 4 MB. | Избери една PNG, JPEG или WebP слика до 4 MB. | a3a41e9716e1 | Pending | — | — |
| screenshot.formats | PNG, JPEG or WebP · up to 4 MB | PNG, JPEG или WebP · до 4 MB | 744516fc90a3 | Pending | — | — |
| screenshot.found.one | {count} found | Пронајдена е {count} објава | b3e92447467a | Pending | — | — |
| screenshot.found.other | {count} found | Пронајдени се {count} објави | 9240a8e964f5 | Pending | — | — |
| screenshot.offline | The screenshot reader could not be reached. Paste the text or try again. | Читањето слики не е достапно. Залепи го текстот или обиди се повторно. | 8e8a9f3f0eb7 | Pending | — | — |
| screenshot.oneFile | Choose one screenshot at a time. | Избери по една слика. | ba013a45529d | Pending | — | — |
| screenshot.orUpload | Or upload a screenshot | Или прикачи слика од екранот | 750c2dffc520 | Pending | — | — |
| screenshot.post | Post {number} | Објава {number} | fd753a6d48a0 | Pending | — | — |
| screenshot.privacy | The app does not save your image or unselected posts. | Апликацијата не ги зачувува сликата и објавите што не си ги избрал. | d3e49caa1cef | Pending | — | — |
| screenshot.read | Read a screenshot | Прочитај слика од екранот | 6e53f3be0a89 | Pending | — | — |
| screenshot.reading | Reading screenshot… | Се чита сликата… | a777a60e0d71 | Pending | — | — |
| screenshot.remove | Remove | Отстрани | 76c16e830a39 | Pending | — | — |
| screenshot.removeLabel | Remove screenshot | Отстрани ја сликата | a8a1609669cb | Pending | — | — |
| screenshot.retry | Retry reading | Прочитај повторно | d1d83e744b8c | Pending | — | — |
| screenshot.selected | Selected post | Избрана објава | fbebddbac5de | Pending | — | — |
| screenshot.unreadable | Couldn't read this screenshot, paste the text instead | Сликата не можеше да се прочита. Залепи го текстот. | c81d866f6381 | Pending | — | — |
| screenshot.upload | Upload screenshot | Прикачи слика од екранот | d1a21ab534c4 | Pending | — | — |
| screenshot.use | Use this post | Користи ја оваа објава | 77b743428c61 | Pending | — | — |
| search.after | After {date} | По {date} | 93e2da942445 | Pending | — | — |
| search.afterTime | At or after {time} each day (Skopje) | Во или по {time} секој ден (Скопје) | 1b182010df76 | Pending | — | — |
| search.anyDate | Any upcoming date | Кој било претстоен датум | 0a8fff45d8d6 | Pending | — | — |
| search.before | Before {date} | Пред {date} | 5369c67420e1 | Pending | — | — |
| search.beforeTime | Before {time} each day (Skopje) | Пред {time} секој ден (Скопје) | c86781a1687b | Pending | — | — |
| search.confidence | {percent}% interpretation confidence | {percent}% сигурност на толкувањето | 1b4677018362 | Pending | — | — |
| search.from | From {city} | Од {city} | bf5153f85646 | Pending | — | — |
| search.interpretation | Search interpretation | Толкување на пребарувањето | b081424dc84c | Pending | — | — |
| search.manual | Your manual filter changes take precedence over this interpretation. | Рачно избраните филтри имаат предност пред ова толкување. | 2258feb6fd77 | Pending | — | — |
| search.noFilters | No reliable filters were extracted | Не се препознаени сигурни критериуми за пребарување | 6d8136073670 | Pending | — | — |
| search.overnight | {after}–{before} (overnight) each day (Skopje) | {after}–{before} (преку полноќ) секој ден (Скопје) | a3dfc3e489d1 | Pending | — | — |
| search.to | To {city} | До {city} | ad4c0bbd5bc8 | Pending | — | — |
| search.unknownCity | unknown city | непознат град | 81fe06eedb5e | Pending | — | — |
| search.warning.ambiguous | Part of the search is ambiguous. Review the filters before continuing. | Дел од пребарувањето е двосмисленo. Провери ги филтрите пред да продолжиш. | aeff14d4df97 | Pending | — | — |
| search.warning.invalid_range | The requested range is invalid. Choose the dates and times manually. | Бараниот период не е важечки. Избери ги датумите и часовите рачно. | 66998ab41faa | Pending | — | — |
| search.warning.needs_review | Part of the search needs review. Confirm the locations, dates and times manually. | Дел од пребарувањето треба да се провери. Потврди ги местата, датумите и часовите рачно. | c7827c0b6fee | Pending | — | — |
| search.warning.unsupported | Part of the search is unsupported. Use the available manual filters. | Дел од пребарувањето не е поддржан. Користи ги достапните рачни филтри. | 26134e388e0a | Pending | — | — |
| search.window | {after}–{before} each day (Skopje) | {after}–{before} секој ден (Скопје) | d47882aa446d | Pending | — | — |
| share.acceptedOnly | Only your accepted bookings can be shared. | Можеш да ги споделуваш само твоите прифатени резервации. | aecb9aed8ac5 | Pending | — | — |
| share.cannotShare | This ride cannot be shared. | Ова патување не може да се сподели. | 3e1dd5d4e66a | Pending | — | — |
| share.copied | Trip link copied. | Врската за патувањето е копирана. | 0b9b23f165fe | Pending | — | — |
| share.copy | Copy link | Копирај врска | 04fc2d912af5 | Pending | — | — |
| share.copyFailed | Could not copy automatically. Select and copy the link below. | Автоматското копирање не успеа. Избери ја и копирај ја врската подолу. | a60946437558 | Pending | — | — |
| share.create | Create or retrieve link | Создај или преземи врска | 60e344a3bfbb | Pending | — | — |
| share.createFailed | Unable to create a link. Please try again. | Врската не можеше да се создаде. Обиди се повторно. | 727f40a4621b | Pending | — | — |
| share.creating | Creating… | Се создава… | 0bb8f4a1e4c3 | Pending | — | — |
| share.deleteFailed | Unable to revoke this trip link. It may already be removed. | Врската не можеше да се укине. Можеби веќе е отстранета. | c7ed272a7b43 | Pending | — | — |
| share.expired | Sharing has expired. | Рокот за споделување истече. | 3ff76998a5e3 | Pending | — | — |
| share.expires | Link access expires {date} (Skopje time), 24 hours after departure. | Пристапот преку врската истекува на {date} (скопско време), 24 часа по поаѓањето. | b9b32bcf440d | Pending | — | — |
| share.insertFailed | Unable to create a trip link. Try again. | Врската за патувањето не можеше да се создаде. Обиди се повторно. | c00c2b5fa5f9 | Pending | — | — |
| share.invalidBooking | Invalid booking. | Невалидна резервација. | 5d365dd61c75 | Pending | — | — |
| share.invalidLink | Invalid trip link. | Невалидна врска за патувањето. | 7ebf72204826 | Pending | — | — |
| share.label | Share itinerary | Сподели план за патувањето | 59419575e461 | Pending | — | — |
| share.link | Trip link | Врска за патувањето | 3f76b939ff84 | Pending | — | — |
| share.loadFailed | Unable to load your trip link. Try again. | Врската за патувањето не можеше да се вчита. Обиди се повторно. | 339b708c7ee7 | Pending | — | — |
| share.manageAccepted | Only your accepted bookings can be managed. | Можеш да управуваш само со твоите прифатени резервации. | f05803fdf8c2 | Pending | — | — |
| share.noLongerShareable | This ride is no longer shareable. | Ова патување повеќе не може да се сподели. | ed73326f8005 | Pending | — | — |
| share.pastExpiry | Sharing expired 24 hours after departure. | Рокот за споделување истече 24 часа по поаѓањето. | 15a039f63b1d | Pending | — | — |
| share.privacy | Share the route and time. Contact details stay private. This is not live tracking. | Сподели ги рутата и времето. Податоците за контакт остануваат приватни. Ова не е следење во живо. | 1f6a21f73c5e | Pending | — | — |
| share.ready | Trip link ready. Anyone with this link can see the limited itinerary. | Врската за патувањето е подготвена. Секој со оваа врска може да го види ограничениот план за патувањето. | 23079524b60a | Pending | — | — |
| share.revoke | Revoke link | Укини врска | 82a40ee9a31f | Pending | — | — |
| share.revokeFailed | Unable to revoke the link. Please try again. | Врската не можеше да се укине. Обиди се повторно. | 1ce556e20366 | Pending | — | — |
| share.revoked | Trip link revoked. New visits cannot open it. | Врската е укината. Повеќе не може да се отвори. | c623a4aef4fd | Pending | — | — |
| share.revoking | Revoking… | Се укинува… | b7ae516814c6 | Pending | — | — |
| share.signIn | Sign in to share your trip. | Најави се за да го споделиш патувањето. | ff61380a89d1 | Pending | — | — |
| share.signInRevoke | Sign in to revoke your trip link. | Најави се за да ја укинеш врската за патувањето. | e4b5ec752404 | Pending | — | — |
| share.title | Share itinerary with a parent | Сподели го планот за патувањето со родител | a5938245a202 | Pending | — | — |
| shared.car | Car: | Возило: | c5279feaf610 | Pending | — | — |
| shared.departure | Departure (Skopje time) | Поаѓање (скопско време) | 5d9db92d50e8 | Pending | — | — |
| shared.disclaimer | This is a planned itinerary, not live tracking. It does not confirm the traveller’s current location. | Ова е план за патување, а не следење во живо. Не ја потврдува тековната локација на патникот. | f81cbc324d21 | Pending | — | — |
| shared.driver | Driver | Возач | f24187f7c330 | Pending | — | — |
| shared.driverUnavailable | Driver details unavailable. | Податоците за возачот не се достапни. | acd411ce548d | Pending | — | — |
| shared.dropoff | Drop-off | Место на слегување | 0c5fb2aca444 | Pending | — | — |
| shared.expiry | Access expires 24 hours after departure and can be revoked by the passenger. | Пристапот истекува 24 часа по поаѓањето и патникот може да го укине. | 9c6502ea7344 | Pending | — | — |
| shared.home | Back to home | Назад на почетна | a2187a5863a2 | Pending | — | — |
| shared.pickup | Pickup | Место на качување | 11257fae7097 | Pending | — | — |
| shared.title | Shared itinerary | Споделен план за патување | aeff63a3ab2a | Pending | — | — |
| shared.to | to | до | 6d04fce707cc | Pending | — | — |
| shared.unavailable | Itinerary unavailable | Планот за патувањето не е достапен | 154ab7686a04 | Pending | — | — |
| shared.unavailableBody | This link may have expired or been revoked, or the trip is no longer confirmed. Ask the passenger for an updated itinerary. | Оваа врска можеби истекла или е укината, или патувањето повеќе не е потврдено. Побарај ажуриран план од патникот. | b5b7602bd504 | Pending | — | — |
| shared.unspecified | Not specified | Не е наведено | 2429330803b3 | Pending | — | — |
| status.accepted | Accepted | Прифатено | 145ccd63d205 | Pending | — | — |
| status.cancelled | Cancelled | Откажано | 36cc146401ed | Pending | — | — |
| status.completed | Completed | Завршено | 66ba6e65d1f3 | Pending | — | — |
| status.declined | Declined | Одбиено | 103be588649c | Pending | — | — |
| status.draft | Draft | Нацрт | 126d97a828bb | Pending | — | — |
| status.full | Full | Пополнето | 3092f30178ca | Pending | — | — |
| status.published | Published | Објавено | 2f1d5edc232b | Pending | — | — |
| status.requested | Requested | Побарано | fb31c4ce6437 | Pending | — | — |
| tag.flexible_pickup | Flexible pickup | Поаѓање по договор | f7ff19ab9632 | Pending | — | — |
| tag.luggage_space | Luggage space | Место за багаж | 3f2515fa2f95 | Pending | — | — |
| tag.music | Music welcome | Музиката е добредојдена | 8233cbce7f66 | Pending | — | — |
| tag.no_smoking | No smoking | Забрането пушење | aaedec18d7b1 | Pending | — | — |
| tag.pets_allowed | Pets allowed | Дозволени миленици | 31a3332af41e | Pending | — | — |
| tag.quiet_ride | Quiet ride | Тивко патување | 3c2c9c083092 | Pending | — | — |
| tripAction.accepted | Request accepted. | Барањето е прифатено. | 67dd664d0808 | Pending | — | — |
| tripAction.alreadyClosed | This booking is already closed. | Оваа резервација веќе е затворена. | 33faf1d79886 | Pending | — | — |
| tripAction.cancelFailed | The booking could not be cancelled. | Резервацијата не можеше да се откаже. | 154d7a7bb0f0 | Pending | — | — |
| tripAction.cancelled | Booking cancelled. | Резервацијата е откажана. | b3d212000849 | Pending | — | — |
| tripAction.cannotCancel | You cannot cancel this booking. | Не можеш да ја откажеш оваа резервација. | d0c94f9afa17 | Pending | — | — |
| tripAction.closed | This ride is no longer accepting booking decisions. | За овој превоз повеќе не може да се прифаќаат или одбиваат резервации. | 288bec35e3e7 | Pending | — | — |
| tripAction.decided | This request was already decided. | За ова барање веќе е донесена одлука. | f7489351c092 | Pending | — | — |
| tripAction.declined | Request declined. | Барањето е одбиено. | f38023a27115 | Pending | — | — |
| tripAction.failed | The request could not be updated. | Барањето не можеше да се ажурира. | a3c2df8c1046 | Pending | — | — |
| tripAction.forbidden | You cannot manage this request. | Не можеш да управуваш со ова барање. | 38dd465ce796 | Pending | — | — |
| tripAction.invalid | Invalid booking. | Невалидна резервација. | 5d365dd61c75 | Pending | — | — |
| tripAction.invalidDecision | Invalid booking decision. | Невалидна одлука за резервацијата. | 1f19d6e42867 | Pending | — | — |
| tripAction.noSeats | The ride no longer has enough available seats. | Превозот повеќе нема доволно слободни места. | ac0dc017cc02 | Pending | — | — |
| tripAction.notFound | Booking request not found. | Барањето за резервација не е пронајдено. | 08e66a9f7ce9 | Pending | — | — |
| tripAction.race | Another accepted request filled the ride. Refresh and review the remaining seats. | Друго прифатено барање го пополни превозот. Освежи ја страницата и провери ги преостанатите места. | 4d3431db55a3 | Pending | — | — |
| trips.accept | Accept | Прифати | 5300a7bdb008 | Pending | — | — |
| trips.accepting | Accepting… | Се прифаќа… | ca494e7bddcf | Pending | — | — |
| trips.actionFailed | The trip could not be updated. Refresh and try again. | Патувањето не можеше да се ажурира. Освежи ја страницата и обиди се повторно. | f0de225ffc62 | Pending | — | — |
| trips.actionSuccess | Your trip has been updated. | Патувањето е ажурирано. | 9b1903eeaefb | Pending | — | — |
| trips.actions | Trip actions | Дејства за патувањето | b6bed2ecbbf0 | Pending | — | — |
| trips.active | Active | Активни | ae45013f8616 | Pending | — | — |
| trips.all | All | Сите | 082194df69e7 | Pending | — | — |
| trips.arrangeChat | Use the ride chat to arrange your meetup. | Договори го местото за средба во разговорот за патувањето. | 12f6bcddf0fc | Pending | — | — |
| trips.bookedHere | Your booked journeys will appear here. | Твоите резервирани патувања ќе се прикажат тука. | 68914587753e | Pending | — | — |
| trips.bookingOptions | Booking options | Опции за резервацијата | 596bedbe99df | Pending | — | — |
| trips.cancelBooking | Cancel booking | Откажи резервација | 1430899f9d0c | Pending | — | — |
| trips.cancelled | Cancelled | Откажани | 3c9da01abded | Pending | — | — |
| trips.cancelledBookingsHere | Cancelled bookings and rides will appear here. | Тука ќе се прикажат откажаните резервации и превози. | fb5be185ac8c | Pending | — | — |
| trips.cancelledHere | Rides you cancel will show up here. | Откажаните понуди ќе се прикажат тука. | ceeb5b7d3443 | Pending | — | — |
| trips.cancelling | Cancelling… | Се откажува… | f15e8f627739 | Pending | — | — |
| trips.chatWhenAccepted | Ride chat becomes available when the driver accepts your booking. | Разговорот е достапен откако возачот ќе ја прифати резервацијата. | ab2709bb1cd2 | Pending | — | — |
| trips.completed | Completed | Завршени | 2350105526bb | Pending | — | — |
| trips.completedHere | Trips you took will appear here once the driver marks them complete. | Патувањата ќе се прикажат тука откако возачот ќе ги означи како завршени. | 77e7fb0fb675 | Pending | — | — |
| trips.confirmed | {count} confirmed · Skopje time | Потврдени места: {count} · време во Скопје | 3059c9311df7 | Pending | — | — |
| trips.contact | Contact: | Контакт: | 729aa14aa7c0 | Pending | — | — |
| trips.decline | Decline | Одбиј | f5370da96473 | Pending | — | — |
| trips.declining | Declining… | Се одбива… | 9fad81d7fa06 | Pending | — | — |
| trips.driver | As a driver | Како возач | aa5b43c11551 | Pending | — | — |
| trips.driverCancelled | The driver cancelled this ride. Please make other travel plans. | Возачот го откажа превозот. Организирај друго патување. | be0e6d89efa7 | Pending | — | — |
| trips.driverFallback | your driver | твојот возач | 7e738f5aa07d | Pending | — | — |
| trips.driverUnavailable | Driver details unavailable | Податоците за возачот не се достапни | 1a6239a738b4 | Pending | — | — |
| trips.feedback | Passengers & feedback | Патници и оценки | 4e46855fd6f9 | Pending | — | — |
| trips.filterDriver | Filter rides by status | Филтрирај понуди според статус | cb479f6302cd | Pending | — | — |
| trips.filterPassenger | Filter passenger trips by status | Филтрирај патувања според статус | e17b74739a8e | Pending | — | — |
| trips.find | Find a ride | Најди превоз | d72d22e24b08 | Pending | — | — |
| trips.finishedHere | Rides you finish will show up here. | Завршените патувања ќе се прикажат тука. | 277c2eb1f12b | Pending | — | — |
| trips.firstOffer | Offer your first ride | Понуди го првиот превоз | eb2dfca39f61 | Pending | — | — |
| trips.firstRide | Find your first ride | Најди го првиот превоз | 3bff90911150 | Pending | — | — |
| trips.intro | Your bookings and offered rides, all in one place. | Твоите резервации и понуди за превоз на едно место. | 87aa4922f9f1 | Pending | — | — |
| trips.loading | Loading trips… | Се вчитуваат патувањата… | 710903af7028 | Pending | — | — |
| trips.manage | Manage ride | Управувај со објавата | 9e5c1d9ea46f | Pending | — | — |
| trips.next | Find your next ride | Најди го следниот превоз | cfe860707f35 | Pending | — | — |
| trips.noActive | No active trips | Нема активни патувања | c4513253f20a | Pending | — | — |
| trips.noActiveRides | No active rides | Нема активни понуди | d969d9c968c6 | Pending | — | — |
| trips.noCancelled | No cancelled trips | Нема откажани патувања | dab55b3f05a3 | Pending | — | — |
| trips.noCancelledRides | No cancelled rides | Нема откажани понуди | ca03396c171b | Pending | — | — |
| trips.noCompleted | No completed trips yet | Сè уште нема завршени патувања | e92a2daf01aa | Pending | — | — |
| trips.noCompletedRides | No completed rides yet | Сè уште нема завршени понуди | e97bbf0926e0 | Pending | — | — |
| trips.noOffers | No rides offered yet | Сè уште немаш понуди за превоз | 10706db865cb | Pending | — | — |
| trips.noRequests | No requests yet. | Сè уште нема барања. | 3cecfec7b279 | Pending | — | — |
| trips.noTripRequests | No trip requests yet | Сè уште немате барања за превоз | a97718799c7b | Pending | — | — |
| trips.offer | Offer a ride | Понуди превоз | f70b3c270f0b | Pending | — | — |
| trips.openChat | Open ride chat | Отвори го разговорот | 325ce3552501 | Pending | — | — |
| trips.passenger | As a passenger | Како патник | cb3056783696 | Pending | — | — |
| trips.pending | {count} pending | На чекање: {count} | 3904d279b79b | Pending | — | — |
| trips.pendingHere | Your pending requests and confirmed bookings will appear here. | Тука ќе се прикажат твоите барања на чекање и потврдените резервации. | fa7be5a6cefd | Pending | — | — |
| trips.requests | Passenger requests | Барања од патници | 02931dd688ec | Pending | — | — |
| trips.rideActions | Ride actions | Дејства за превозот | 398b02e519ad | Pending | — | — |
| trips.seats.booked.one | {count} seat booked | {count} место · резервирани | c486d864bab2 | Pending | — | — |
| trips.seats.booked.other | {count} seats booked | {count} места · резервирани | 0175264d8dd7 | Pending | — | — |
| trips.seats.other.one | {count} seat | {count} место | 7fa2c5dac494 | Pending | — | — |
| trips.seats.other.other | {count} seats | {count} места | 717dbb5be466 | Pending | — | — |
| trips.seats.requested.one | {count} seat requested | {count} место · побарани | 643277f77f25 | Pending | — | — |
| trips.seats.requested.other | {count} seats requested | {count} места · побарани | 3ff9d18153de | Pending | — | — |
| trips.spareSeat | Have a spare seat? Give someone a way home. | Имаш слободно место? Помогни некому да стигне дома. | aff5a458ac7c | Pending | — | — |
| trips.status.awaiting | Awaiting approval | Чека одобрување | 16e33a6c6fb9 | Pending | — | — |
| trips.status.bookingCancelled | Booking cancelled | Резервацијата е откажана | f65f57df3bfe | Pending | — | — |
| trips.status.closed | Request closed | Барањето е затворено | 29dcf1804494 | Pending | — | — |
| trips.status.completed | Completed | Завршено | 66ba6e65d1f3 | Pending | — | — |
| trips.status.confirmed | Confirmed | Потврдено | ff508b9aee80 | Pending | — | — |
| trips.status.declined | Request declined | Барањето е одбиено | b34c408a6dc6 | Pending | — | — |
| trips.status.rideCancelled | Ride cancelled | Превозот е откажан | 3ff0880b43a1 | Pending | — | — |
| trips.student | Student | Студент | 796fbe4af5c3 | Pending | — | — |
| trips.title | My trips | Мои патувања | 8d81cc367d19 | Pending | — | — |
| trips.total | {price} total | Вкупно {price} | eb19b44a60a2 | Pending | — | — |
| trips.travelledWith | Travelled with | Патуваше со | 43c44aec0b51 | Pending | — | — |
| trips.view | View trip | Види патување | 94c18a6b1614 | Pending | — | — |
| trips.viewRide | View ride | Види превоз | 4306d5d5f566 | Pending | — | — |
| trips.views | Trip views | Преглед на патувањата | 7fb707447442 | Pending | — | — |
| trips.yourDriver | Your driver | Твојот возач | 0006baa9036a | Pending | — | — |
| trips.yourPassenger | your passenger | твојот патник | 9eccbecd8f18 | Pending | — | — |
| validation.car | Choose a valid car and review its details. | Избери важечко возило и провери ги неговите податоци. | 6c87a855c186 | Pending | — | — |
| validation.city | Choose valid, different departure and destination cities. | Избери важечки и различни градови за поаѓање и пристигнување. | 612f622bb1f0 | Pending | — | — |
| validation.consumption | Enter consumption between 0.5 and 30 L/100 km. | Внеси потрошувачка од 0,5 до 30 L/100 km. | 476d6a3b0bed | Pending | — | — |
| validation.departure | Choose a future departure within the next 90 days. | Избери идно поаѓање во следните 90 дена. | 99c8d5a4c16d | Pending | — | — |
| validation.distance | Enter a distance between 1 and 600 km. | Внеси растојание од 1 до 600 km. | 3925b3627de2 | Pending | — | — |
| validation.generic | Review this field and try again. | Провери го ова поле и обиди се повторно. | 1017a9185576 | Pending | — | — |
| validation.notes | Keep notes within 2,000 characters. | Забелешките може да содржат најмногу 2.000 знаци. | 7d18ca270f90 | Pending | — | — |
| validation.plate | Use the final 3 letters or numbers from the plate. | Внеси ги последните 3 букви или бројки од регистрацијата. | 83d5c672cf5a | Pending | — | — |
| validation.price | Enter a whole-number price between 0 and 3,000 MKD. | Внеси целобројна цена од 0 до 3.000 денари. | 1aacf096a149 | Pending | — | — |
| validation.seats | Choose between 1 and 8 passenger seats. | Избери од 1 до 8 места за патници. | a2eca812d374 | Pending | — | — |
