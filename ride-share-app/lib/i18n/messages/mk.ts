import { errorsMk } from "./errors-mk";
import { onboardingMk } from "./onboarding-mk";
import { detailMk } from "./detail-mk";
import { discoveryMk } from "./discovery-mk";
import type { Messages } from "./en";
import { aboutMk } from "./about-mk";
import { authMk } from "./auth-mk";
import { offerMk } from "./offer-mk";
import { rideFormMk } from "./ride-form-mk";
import { importFlowMk } from "./import-flow-mk";
import { tripsMk } from "./trips-mk";
import { profileFlowMk } from "./profile-flow-mk";
import { chatMk } from "./chat-mk";
import { sharingMk } from "./sharing-mk";
import { explanationsMk } from "./explanations-mk";

// Draft Macedonian copy. Human approval is tracked in docs/plans/AJDE-29-translation-review.md.
export const mk = {
  ...errorsMk,
  ...rideFormMk,
  ...importFlowMk,
  ...tripsMk,
  ...profileFlowMk,
  ...chatMk,
  ...sharingMk,
  ...explanationsMk,
  ...offerMk,
  ...detailMk,
  ...discoveryMk,
  ...onboardingMk,
  ...aboutMk,
  ...authMk,
  "app.title": "Студентски заеднички превоз",
  "app.description":
    "Патувајте заедно и поделете ги реалните патни трошоци со студенти низ Северна Македонија.",
  "nav.home": "ajde — почетна страница",
  "nav.skip": "Прескокни до содржината",
  "nav.main": "Главно мени",
  "nav.find": "Најди превоз",
  "nav.offer": "Понуди превоз",
  "nav.trips": "Мои патувања",
  "nav.profile": "Профил",
  "nav.signIn": "Најави се",
  "nav.signUp": "Регистрирај се",
  "nav.signOut": "Одјави се",
  "nav.open": "Отвори мени",
  "nav.close": "Затвори мени",
  "nav.footer": "Мени на дното на страницата",
  "nav.about": "За нас",
  "nav.copyright": "© {year} ajde. Создадено во Скопје.",
  "locale.label": "Јазик",
  "locale.switch": "Промени јазик",
  "locale.saving": "Се менува јазикот…",
  "locale.failed": "Јазикот не може да се промени. Обидете се повторно.",
  "date.today": "Денес",
  "date.tomorrow": "Утре",
  "date.weekend": "Викенд",
  "date.any": "Кој било ден",
  "date.chooseDate": "Изберете датум на поаѓање",
  "date.previousMonth": "Претходен месец",
  "date.nextMonth": "Следен месец",
  "date.chooseTime": "Изберете време",
  "date.chooseDateTime": "Изберете датум и време",
  "date.departureDateTime": "Изберете датум и време на поаѓање",
  "date.limit": "Изберете време во следните 90 дена, според времето во Скопје.",
  "date.time": "Време",
  "date.hour": "Час",
  "date.minute": "Минута",
  "date.done": "Готово",
  "date.chooseATime": "Изберете време",
  "date.dayFirst": "Прво изберете ден",
  "date.summary": "{date} · {time}",
  "landing.title": "Поблиску, заедно",
  "landing.quickerCheaper": "Побрзо. Поевтино.",
  "landing.greener": "Позелено.",
  "landing.rideHome": "Твојот превоз до дома.",
  "landing.intro":
    "Пополни ги слободните седишта на патот до дома. Подели ги трошоците за гориво, запознај други студенти и намали го загадувањето со секое патување.",
  "landing.where": "Каде патуваш?",
  "landing.from": "Од",
  "landing.to": "До",
  "landing.leaving": "Од каде поаѓаш?",
  "landing.going": "Каде одиш?",
  "landing.loadingCities": "Се вчитуваат градовите…",
  "landing.swap": "Замени ги местата на поаѓање и пристигнување",
  "landing.sharedSaving": "Заедничкото патување заштедува околу 21 kg CO₂.",
  "landing.statistics": "Податоци за заедничките патувања",
  "landing.statisticsUnavailable":
    "Податоците за патувањата привремено не се достапни.",
  "landing.statisticsLoading": "Се вчитуваат податоците за патувањата…",
  "landing.co2": "Проценета заштеда на CO₂",
  "landing.fuel": "Проценета заштеда на гориво",
  "landing.participants": "Корисници",
  "landing.completed": "Заеднички патувања",
  "landing.lake": "Охридско Езеро",
  "landing.skopje": "Скопје",
  "landing.ohrid": "Охрид",
  "landing.pickedUp": "+2 патници се приклучија",
  "common.saving": "Се зачувува…",
  "common.loading": "Се вчитува…",

  "common.notFound": "Страницата не е пронајдена",
  "common.notFoundBody": "Оваа страница не постои или повеќе не е достапна.",
  "loading.rides": "Се вчитуваат понудите за превоз…",
  "loading.ride": "Се вчитува патувањето…",
  "loading.form": "Се вчитува формуларот…",
  "loading.profile": "Се вчитува профилот…",
  "loading.chat": "Се вчитува разговорот за патувањето…",
  "loading.itinerary": "Се вчитува споделениот план за патување…",
  "loading.offer": "Се вчитува формуларот за превоз…",
  "loading.login": "Се вчитува најавата…",
  "landing.excluded.one":
    "{count} завршено заедничко патување не е вклучено во проценетите заштеди поради недостасувачки или неподдржани податоци за возилото или растојанието.",
  "landing.excluded.other":
    "{count} завршени заеднички патувања не се вклучени во проценетите заштеди поради недостасувачки или неподдржани податоци за возилото или растојанието.",
} satisfies Messages;
