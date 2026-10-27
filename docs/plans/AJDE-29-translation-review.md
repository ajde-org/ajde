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

## Message register (354 messages)

| Key / context | English | Macedonian | Revision | Status | Reviewer | Date |
| --- | --- | --- | --- | --- | --- | --- |
| about.bitolaAlt | Post: free seats, Tuesday 22.09, Skopje to Bitola, leaving at 14:00, message me. | Објава: слободни седишта, вторник 22.09, Скопје до Битола, поаѓање во 14:00, пишете ми. | 72942433222d | Pending | — | — |
| about.calculation | How we calculate savings | Како ги пресметуваме заштедите | d67d4c350a5f | Pending | — | — |
| about.calculationBody | Every accepted passenger seat counts as one car trip that did not happen. We estimate what that trip would have burned using the shared car's real consumption. | Секое прифатено патничко седиште го сметаме за едно избегнато патување со автомобил. Заштеденото гориво го проценуваме според реалната потрошувачка на автомобилот со кој се патува. | 00f54bb63e9f | Pending | — | — |
| about.calculationHeading | Simple math, shown openly. | Едноставна и јасна пресметка. | 9734244358fa | Pending | — | — |
| about.co2Formula | fuel × 2.31 kg per litre of petrol, or 2.68 kg for diesel | гориво × 2,31 kg за литар бензин или 2,68 kg за дизел | 7bf4cb075275 | Pending | — | — |
| about.completedOnly | Only completed rides with petrol or diesel cars and a valid distance count. Demo rides are excluded. | Се бројат само завршени патувања со бензински или дизел автомобили и познато растојание. Примерните патувања се исклучени. | f5557011d1cb | Pending | — | — |
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
| about.methodology | Completed trips with accepted passengers; demo rides excluded. Participants count each driver or passenger once. Savings assume each passenger seat replaces a separate car; petrol and diesel trips with valid distance and consumption only. | Се бројат завршени патувања со прифатени патници, без примерните патувања. Секој возач или патник се брои еднаш. Заштедите се пресметуваат под претпоставка дека секој патник заменува посебен автомобил, само за бензински и дизел возила со познато растојание и потрошувачка. | 82d4bb2b4dfb | Pending | — | — |
| about.ohridAlt | Post: ride Ohrid to Skopje on 22.09, 3 seats, leaving at 7:30, with a phone number. | Објава: превоз Охрид до Скопје на 22.09, 3 седишта, поаѓање во 7:30, со телефонски број. | 42203c2c2b89 | Pending | — | — |
| about.oneCar | 1 car | 1 автомобил | 25cfff94c8b1 | Pending | — | — |
| about.oneCarBody | Three passengers in one car keeps three other cars off the road. | Тројца патници во еден автомобил значат три автомобили помалку на патот. | d029c2330c2b | Pending | — | — |
| about.post | Post in your own words | Опиши го патувањето со свои зборови | 6fc7ff35c5b5 | Pending | — | — |
| about.postBody | Describe the trip like you would in a group chat. We turn it into a ride you review before publishing. | Опиши го патувањето како во групна порака. Ние го претвораме во понуда за превоз што ја проверуваш пред да ја објавиш. | 95e4b714a185 | Pending | — | — |
| about.posts | Example ride posts | Примери за објави за превоз | 8be436facbe0 | Pending | — | — |
| about.postsDaily | posts a day | објави дневно | daf2c13d9e60 | Pending | — | — |
| about.price | Guesswork on price | Цени од око | 5e706cbc86b3 | Pending | — | — |
| about.priceBody | Drivers guess what to charge. Passengers cannot tell if the price is fair. | Возачите ја одредуваат цената од око. Патниците не знаат дали е правична. | c7557f3d4591 | Pending | — | — |
| about.problem | The problem | Проблемот | 613e5a8de6dd | Pending | — | — |
| about.problemHeading | Getting home should not take six group chats. | За да стигнеш дома, не треба да пребаруваш шест групи. | d5a09f00765c | Pending | — | — |
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
| auth.sent | A secure sign-in link was sent to {email}. | Безбедна врска за најава е испратена на {email}. | 8a4012e85a03 | Pending | — | — |
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
| chat.loadFailed | Could not load the ride room | Собата за разговор не може да се вчита | acb0195d2dd0 | Pending | — | — |
| chat.room | Ride room | Соба за разговор за патувањето | e2991fed8ef2 | Pending | — | — |
| common.connection | Check your connection and try again. | Проверете ја интернет-врската и обидете се повторно. | 0a639d54174c | Pending | — | — |
| common.error | Something went wrong | Настана грешка | 2513bd2a33cf | Pending | — | — |
| common.home | Back to home | Назад на почетната страница | 167da07a0fa6 | Pending | — | — |
| common.loadFailed | We could not load this page | Страницата не може да се вчита | 760834d1eebf | Pending | — | — |
| common.loading | Loading… | Се вчитува… | 512cab753a79 | Pending | — | — |
| common.notFound | Page not found | Страницата не е пронајдена | 4ea4d85b1c24 | Pending | — | — |
| common.notFoundBody | This page does not exist or is no longer available. | Оваа страница не постои или повеќе не е достапна. | f5bf85a1cb16 | Pending | — | — |
| common.retry | Try again | Обидете се повторно | aa0217c7a691 | Pending | — | — |
| common.saving | Saving… | Се зачувува… | 34d6319db92d | Pending | — | — |
| contact.invalidPhone | Enter a valid phone number, including your country code. | Внеси важечки телефонски број со повикувачки број на државата. | 4353aa9ad9a3 | Pending | — | — |
| contact.invalidSocial | Enter a full HTTPS profile link, such as https://instagram.com/yourname. | Внеси целосна HTTPS врска до профил, на пример https://instagram.com/yourname. | 41f4d0f27aa5 | Pending | — | — |
| contact.phoneDigits | Use a phone number with 7–15 digits. | Телефонскиот број треба да има од 7 до 15 цифри. | 3f2f0a5293c8 | Pending | — | — |
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
| discovery.filterHelp | Dates are optional. A from date alone selects one day; a through date includes that day. Times apply every day in Skopje time. If the end time is earlier, the window crosses midnight. | Датумите се незадолжителни. Само почетен датум избира еден ден; крајниот датум е вклучен во опсегот. Часовите важат секој ден според времето во Скопје. Ако крајниот час е порано, периодот продолжува по полноќ. | 5b251e593fe6 | Pending | — | — |
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
| landing.co2 | Est. CO₂ saved | Проценета заштеда на CO₂ | 960d8f4273d7 | Pending | — | — |
| landing.completed | Shared trips completed | Заеднички патувања | 7ec5aea8a58c | Pending | — | — |
| landing.excluded.one | {count} completed shared trip excluded from savings estimates because vehicle or distance data is missing or unsupported. | {count} завршено заедничко патување не е вклучено во проценетите заштеди поради недостасувачки или неподдржани податоци за возилото или растојанието. | 190ca0f1798f | Pending | — | — |
| landing.excluded.other | {count} completed shared trips excluded from savings estimates because vehicle or distance data is missing or unsupported. | {count} завршени заеднички патувања не се вклучени во проценетите заштеди поради недостасувачки или неподдржани податоци за возилото или растојанието. | 3e38e7aeed83 | Pending | — | — |
| landing.from | From | Од | c3398819487b | Pending | — | — |
| landing.fuel | Est. fuel saved | Проценета заштеда на гориво | c9364fe75954 | Pending | — | — |
| landing.going | Going to | Каде одиш? | 7ec9bd57760b | Pending | — | — |
| landing.greener | Greener. | Позелено. | 40aec01c6338 | Pending | — | — |
| landing.intro | Fill the empty seats on your way home. Split the fuel, meet other students, and leave a smaller footprint on every trip. | Пополни ги слободните седишта на пат до дома. Подели ги трошоците за гориво, запознај други студенти и намали го загадувањето со секое патување. | e0b6032e5384 | Pending | — | — |
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
| onboarding.privacy | Your name, photo and university are visible to other students. Your phone is shared with drivers when you request a seat. Your phone and optional social link are visible to fellow members in accepted ride rooms. | Твоето име, фотографија и универзитет се видливи за другите студенти. Возачот го гледа твојот телефон кога ќе побараш место. Телефонот и врската до друштвениот профил се видливи за членовите на собата за разговор по прифаќањето. | 9d03b6ac1ec0 | Pending | — | — |
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
| profile.connectionError | Connection error | Проблем со врската | 1fd776af641d | Pending | — | — |
| profile.label | Profile | Профил | 5686c1a95393 | Pending | — | — |
| profile.loadFailed | The profile did not load | Профилот не може да се вчита | af0e1b99564c | Pending | — | — |
| profile.notFound | Student not found | Студентот не е пронајден | 6f433355e7df | Pending | — | — |
| profile.notFoundBody | This profile may not exist yet, or it may no longer be available. | Овој профил можеби сè уште не постои или веќе не е достапен. | 3c2ba1f8bc41 | Pending | — | — |
| profile.unavailable | The service may be temporarily unavailable. Your session and data are safe. | Услугата можеби е привремено недостапна. Твојата сесија и податоци се зачувани. | 61fa4c5f8fb6 | Pending | — | — |
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
| search.warning.ambiguous | Part of the search is ambiguous. Review the filters before continuing. | Дел од пребарувањето е двосмислен. Провери ги филтрите пред да продолжиш. | e6cd396eac85 | Pending | — | — |
| search.warning.invalid_range | The requested range is invalid. Choose the dates and times manually. | Бараниот период не е важечки. Избери ги датумите и часовите рачно. | 66998ab41faa | Pending | — | — |
| search.warning.needs_review | Part of the search needs review. Confirm the locations, dates and times manually. | Дел од пребарувањето треба да се провери. Потврди ги местата, датумите и часовите рачно. | c7827c0b6fee | Pending | — | — |
| search.warning.unsupported | Part of the search is unsupported. Use the available manual filters. | Дел од пребарувањето не е поддржан. Користи ги достапните рачни филтри. | 26134e388e0a | Pending | — | — |
| search.window | {after}–{before} each day (Skopje) | {after}–{before} секој ден (Скопје) | d47882aa446d | Pending | — | — |
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
| tag.no_smoking | No smoking | Без пушење | eb2ab385f00f | Pending | — | — |
| tag.pets_allowed | Pets allowed | Дозволени миленици | 31a3332af41e | Pending | — | — |
| tag.quiet_ride | Quiet ride | Тивко патување | 3c2c9c083092 | Pending | — | — |
