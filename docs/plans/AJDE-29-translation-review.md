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

## Message register (174 messages)

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
| about.howHeading | One place for every ride between cities. | Едно место за секое меѓуградско патување. | 49005fc34dbb | Pending | — | — |
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
| about.rideBody | Chat in a private ride room, share the real fuel cost, and rate each other afterwards. | Договорете се во приватниот разговор за патувањето, поделете го реалниот трошок за гориво и оценете се по патувањето. | 47ad0f2acdf8 | Pending | — | — |
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
| about.visionBody | Every weekend, students leave Skopje for their hometowns, mostly in cars with empty seats. We want each of those seats to carry someone. | Секој викенд студентите се враќаат од Скопје во своите градови, најчесто со празни седишта во автомобилите. Сакаме на секое од тие седишта да патува некој. | ecedffd8f5d4 | Pending | — | — |
| about.visionHeading | Every trip home, with every seat filled. | На секое патување до дома — сите седишта пополнети. | cee08bd6e381 | Pending | — | — |
| about.whyGreen | Why it is greener | Зошто е подобро за природата | 66320895150e | Pending | — | — |
| app.description | Share rides and real travel costs with students across North Macedonia. | Патувајте заедно и поделете ги реалните патни трошоци со студенти низ Северна Македонија. | 240423357072 | Pending | — | — |
| app.title | Student Ride Share | Студентски заеднички превоз | 7117f167853e | Pending | — | — |
| auth.access | Account access | Пристап до сметката | 613087b70ce4 | Pending | — | — |
| auth.accountHint | One email, one account. Your first sign-in creates your account automatically. | Една е-пошта, една сметка. При првата најава сметката се создава автоматски. | d90ea571c98c | Pending | — | — |
| auth.approvedEmail | Use an approved student email address to continue. | За да продолжите, внесете е-пошта од одобрен студентски домен. | 8fab22e61db4 | Pending | — | — |
| auth.company | The journey is better with good company. | Патувањето е поубаво со добро друштво. | 9f064b2bfdf8 | Pending | — | — |
| auth.continuing | Continuing… | Се обработува… | 3e35a9d2f812 | Pending | — | — |
| auth.cost | Split the real cost | Поделете го реалниот трошок | d5e952e3fa39 | Pending | — | — |
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
| common.connection | Check your connection and try again. | Проверете ја интернет-врската и обидете се повторно. | 0a639d54174c | Pending | — | — |
| common.error | Something went wrong | Настана грешка | 2513bd2a33cf | Pending | — | — |
| common.home | Back to home | Назад на почетната страница | 167da07a0fa6 | Pending | — | — |
| common.loadFailed | We could not load this page | Страницата не може да се вчита | 760834d1eebf | Pending | — | — |
| common.loading | Loading… | Се вчитува… | 512cab753a79 | Pending | — | — |
| common.notFound | Page not found | Страницата не е пронајдена | 4ea4d85b1c24 | Pending | — | — |
| common.notFoundBody | This page does not exist or is no longer available. | Оваа страница не постои или повеќе не е достапна. | f5bf85a1cb16 | Pending | — | — |
| common.retry | Try again | Обидете се повторно | aa0217c7a691 | Pending | — | — |
| common.saving | Saving… | Се зачувува… | 34d6319db92d | Pending | — | — |
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
| landing.co2 | Est. CO₂ saved | Проценета заштеда на CO₂ | 960d8f4273d7 | Pending | — | — |
| landing.completed | Shared trips completed | Завршени заеднички патувања | 77331a695631 | Pending | — | — |
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
| landing.participants | Unique participants | Различни учесници | 74459318a909 | Pending | — | — |
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
